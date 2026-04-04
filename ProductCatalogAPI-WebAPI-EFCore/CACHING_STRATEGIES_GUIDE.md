# 🚀 Caching Strategies Guide - ProductCatalogAPI

Complete guide showing 5 different caching approaches with implementations, comparisons, and when to use each.

---

## 📋 Table of Contents

1. [Caching Overview](#caching-overview)
2. [Comparison Table](#comparison-table)
3. [Approach 1: In-Memory Cache](#approach-1-in-memory-cache)
4. [Approach 2: Distributed Cache (Redis)](#approach-2-distributed-cache-redis)
5. [Approach 3: HTTP Cache Headers](#approach-3-http-cache-headers)
6. [Approach 4: Response Caching Middleware](#approach-4-response-caching-middleware)
7. [Approach 5: Entity Framework Query Cache](#approach-5-entity-framework-query-cache)
8. [Production Recommendations](#production-recommendations)

---

## 🎯 Caching Overview

### What is Caching?

```
First Request (No Cache):
  User → Database query → Processing → Response (500ms)

Second Request (With Cache):
  User → [Check Cache] → Found! → Response (5ms)
           ↓ (100x faster!)
```

### Why Cache?

```
✓ Reduce database load (fewer queries)
✓ Faster response times (less processing)
✓ Better scalability (handle more users)
✓ Lower bandwidth usage (smaller responses or cached on client)
✓ Improved user experience (snappier)
```

### Cache Invalidation (The Hard Problem)

```
When to clear cache?
├─ Time-based: "Keep cache for 5 minutes"
├─ Event-based: "Clear when product is updated"
├─ Manual: "Send clear command"
└─ LRU: "Remove least recently used items"

⚠️ Stale data risk: Old cached data instead of fresh data
```

---

## 📊 Comparison Table

| Feature | In-Memory | Redis | HTTP Headers | EF Query | Response MW |
|---------|-----------|-------|--------------|----------|------------|
| **Setup Complexity** | ⭐ Very Easy | ⭐⭐⭐⭐ Hard | ⭐⭐ Easy | ⭐ Easy | ⭐⭐ Easy |
| **Performance** | ⭐⭐⭐⭐⭐ Fastest | ⭐⭐⭐⭐ Fast | ⭐⭐⭐⭐⭐ Via Client | ⭐⭐⭐ Good | ⭐⭐⭐⭐ Fast |
| **Persistence** | ❌ No | ✅ Yes | ⚠️ Client | ❌ No | ❌ No |
| **Multi-Server** | ❌ No | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Memory Usage** | ⭐⭐ Medium | ⭐⭐⭐ High | ⭐ Low | ⭐⭐ Medium | ⭐⭐ Medium |
| **Use Case** | Dev/Learning | Production | All | ORM Level | API Level |
| **Learning Difficulty** | ⭐ Easy | ⭐⭐⭐⭐ Hard | ⭐⭐ Medium | ⭐ Easy | ⭐⭐ Medium |
| **Survives Restart** | ❌ No | ✅ Yes | N/A | ❌ No | ❌ No |
| **Network Overhead** | N/A | ⭐⭐⭐ Network calls | N/A | N/A | N/A |

---

## 💾 Approach 1: In-Memory Cache (IMemoryCache)

### ⭐ Best For: Learning, Development, Single-Server Apps

### How It Works

```
Application Memory (RAM)
┌────────────────────────────────┐
│    IMemoryCache Container      │
│  ┌──────────────────────────┐  │
│  │ Key: "products-all"      │  │
│  │ Value: [Product {...}]   │  │
│  │ ExpireAt: 5 min from now │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
     ↑ Lost when app restarts
```

### Step 1: Add NuGet Package (Built-in, No Install Needed!)

```bash
# In-Memory Cache is included by default
# No dotnet add package needed!
```

### Step 2: Register in Program.cs

```csharp
// Add to Program.cs
builder.Services.AddMemoryCache();
```

### Step 3: Inject and Use in Service

```csharp
using Microsoft.Extensions.Caching.Memory;

public class ProductService : IProductService
{
    private readonly ProductDbContext _context;
    private readonly IMemoryCache _cache;
    private const string CACHE_KEY_ALL_PRODUCTS = "products-all";
    private const int CACHE_DURATION_MINUTES = 5;

    public ProductService(ProductDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    // IMPORTANT FLOW: Read from cache first, then database
    public async Task<List<Product>> GetAllAsync()
    {
        // Step 1: Check if data exists in cache
        if (_cache.TryGetValue(CACHE_KEY_ALL_PRODUCTS, out List<Product>? cachedProducts))
        {
            Console.WriteLine("✓ Cache HIT: Returning from memory cache");
            return cachedProducts!;
        }

        // Step 2: Cache miss - fetch from database
        Console.WriteLine("✗ Cache MISS: Fetching from database");
        var products = await _context.Products
            .Where(p => p.IsActive)
            .OrderBy(p => p.Name)
            .AsNoTracking()
            .ToListAsync();

        // Step 3: Store in cache for 5 minutes
        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

        _cache.Set(CACHE_KEY_ALL_PRODUCTS, products, cacheOptions);

        return products;
    }

    // IMPORTANT: Invalidate cache when data changes
    public async Task<Product> CreateAsync(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // Clear cache - new product added
        _cache.Remove(CACHE_KEY_ALL_PRODUCTS);
        Console.WriteLine("🗑️  Cache invalidated: New product added");

        return product;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return false;

        product.IsActive = false;
        await _context.SaveChangesAsync();

        // Clear cache - product updated
        _cache.Remove(CACHE_KEY_ALL_PRODUCTS);
        Console.WriteLine("🗑️  Cache invalidated: Product deleted");

        return true;
    }
}
```

### Advantages

```
✅ Zero external dependencies
✅ Blazing fast (in-process)
✅ Easy to implement
✅ Good for learning
✅ Ideal for single-server apps
✅ No network overhead
```

### Disadvantages

```
❌ Lost on app restart
❌ Not shared between servers
❌ Memory grows unbounded (can cause memory leaks)
❌ Thread-safety needed
❌ No persistence
```

### Cache Console Output Example

```
First Request:
  ✗ Cache MISS: Fetching from database
  (SELECT * FROM Products WHERE IsActive=1 - 100ms)

Second Request (within 5 min):
  ✓ Cache HIT: Returning from memory cache
  (Instant return!)

Third Request (after 5 min):
  ✗ Cache MISS: Cache expired, fetching from database
  (SELECT * FROM Products WHERE IsActive=1 - 95ms)

When Create/Update/Delete:
  🗑️  Cache invalidated: New product added
  (Next request will fetch fresh data)
```

---

## 🔴 Approach 2: Distributed Cache (Redis)

### ⭐ Best For: Production, Multi-Server, Scalable Apps

### How It Works

```
                    Server 1
                    ┌─────────────┐
                    │  App 1      │
                    │  (NodeA)    │
                    └────────┬────┘
                             │ Cache Miss
                             ↓ Go to Redis
                    ┌────────────────────┐
                    │   Redis Server     │  ← Shared Cache
Server 2            │  (Central Store)   │
┌─────────────┐     │ products-all: [...] │
│  App 2      │────→│ products-123: {...} │
│  (NodeB)    │     │ (Persists forever) │
└─────────────┘     └────────────────────┘
```

### Step 1: Install Redis Server

**Option A: Docker (Easiest)**
```bash
docker run -d -p 6379:6379 redis:latest
# Redis runs on localhost:6379
```

**Option B: Windows Download**
```
Download from: https://github.com/microsoftarchive/redis/releases
Run: redis-server.exe
```

**Option C: WSL (Windows Subsystem for Linux)**
```bash
wsl
sudo apt-get install redis-server
redis-server
```

### Step 2: Add NuGet Package

```bash
dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis
```

### Step 3: Register in Program.cs

```csharp
// Add to Program.cs
builder.Services.AddStackExchangeRedisCache(options =>
    options.Configuration = "localhost:6379"
);
```

### Step 4: Use IDistributedCache in Service

```csharp
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

public class ProductService : IProductService
{
    private readonly ProductDbContext _context;
    private readonly IDistributedCache _cache;

    public ProductService(ProductDbContext context, IDistributedCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<List<Product>> GetAllAsync()
    {
        const string cacheKey = "products-all";

        // Step 1: Try to get from Redis
        var cachedData = await _cache.GetStringAsync(cacheKey);

        if (cachedData != null)
        {
            Console.WriteLine("✓ Redis Cache HIT");
            return JsonSerializer.Deserialize<List<Product>>(cachedData)!;
        }

        // Step 2: Cache miss - fetch from database
        Console.WriteLine("✗ Redis Cache MISS: Fetching from database");
        var products = await _context.Products
            .Where(p => p.IsActive)
            .OrderBy(p => p.Name)
            .AsNoTracking()
            .ToListAsync();

        // Step 3: Store in Redis (5 minute TTL)
        var cacheOptions = new DistributedCacheEntryOptions
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(5));

        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(products),
            cacheOptions
        );

        return products;
    }

    public async Task<Product> CreateAsync(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // Invalidate Redis cache
        await _cache.RemoveAsync("products-all");
        Console.WriteLine("🗑️  Redis cache invalidated");

        return product;
    }
}
```

### Advantages

```
✅ Persists across server restarts
✅ Shared across multiple servers
✅ Extremely fast (sub-millisecond)
✅ Can handle massive scale
✅ Production-ready
✅ Many use cases (caching, sessions, queues)
```

### Disadvantages

```
❌ Requires Redis server running
❌ Additional network calls
❌ More complex setup
❌ Memory costs (Redis instance)
❌ Learning curve
```

---

## 🌐 Approach 3: HTTP Cache Headers

### ⭐ Best For: Public APIs, Client Caching, CDNs

### How It Works

```
First Request:
  Browser/Client → API → Response with Cache Headers

Response Headers:
  Cache-Control: public, max-age=300     ← "Cache for 5 minutes"
  ETag: "abc123def456"                   ← "This is version abc123"
  Last-Modified: Wed, 04 Apr 2026 ...    ← "Last changed at this time"

Second Request (within 5 min):
  Browser/Client → [Uses cached response] ✓ (No server hit!)

After 5 minutes:
  Client → Server: "Is your ETag still abc123?"
  Server → "Yes, use your cache" (304 Not Modified - tiny response!)
  OR "No, here's new version" (200 with new data)
```

### Implementation

```csharp
public class ProductsController : ControllerBase
{
    [HttpGet]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    // Duration = 5 minutes, Any = public + proxy caches
    public async Task<IActionResult> GetAll()
    {
        var products = await _productService.GetAllAsync();
        return Ok(products);
    }

    [HttpGet("{id}")]
    [ResponseCache(Duration = 600, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _productService.GetByIdAsync(id);
        if (product == null) return NotFound();
        return Ok(product);
    }

    [HttpPost]
    [ResponseCache(NoStore = true)]  // Don't cache POST (creates new data)
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
    {
        var product = await _productService.CreateAsync(request.ToEntity());
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    [ResponseCache(NoStore = true)]  // Don't cache PUT (modifies data)
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductRequest request)
    {
        var result = await _productService.UpdateAsync(id, request.ToEntity());
        if (!result) return NotFound();
        return Ok();
    }
}
```

### Program.cs Setup

```csharp
builder.Services.AddResponseCaching();

var app = builder.Build();

app.UseResponseCaching();  // Add middleware
app.MapControllers();
app.Run();
```

### HTTP Response Headers

```
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=300           ← 5 min cache
ETag: "products-all-v1"                      ← Version identifier
Last-Modified: Wed, 04 Apr 2026 22:30:00 GMT ← Last changed
Content-Length: 1234
Date: Wed, 04 Apr 2026 22:35:00 GMT

[Products JSON Data...]
```

### Advantages

```
✅ Reduces server load dramatically
✅ Faster for end users
✅ Works with CDNs
✅ Browser native support
✅ No server-side resources
✅ RESTful best practice
```

### Disadvantages

```
❌ Client must support caching
❌ No guarantee client will cache
❌ Browser may bypass (hard refresh)
❌ More complex to invalidate
```

---

## 🔄 Approach 4: Response Caching Middleware

### ⭐ Best For: API-Level Caching, Standardized Responses

### How It Works

```
Request → ResponseCachingMiddleware → Check Server Cache
                                          ↓
                       Found? → Yes → Return cached response
                                          ↓ No
                                    Execute controller
                                    Cache response
                                    Return to client
```

### Implementation

```csharp
// Program.cs
builder.Services.AddResponseCaching();

var app = builder.Build();

app.UseResponseCaching();
app.MapControllers();
app.Run();

// ProductsController.cs
public class ProductsController : ControllerBase
{
    [HttpGet]
    [ResponseCache(
        Duration = 300,
        Location = ResponseCacheLocation.Any,
        VaryByQueryKeys = new[] { "category", "skip", "take" }
    )]
    public async Task<IActionResult> GetAll(string? category, int skip = 0, int take = 10)
    {
        var products = await _productService.GetAllAsync();

        if (!string.IsNullOrEmpty(category))
            products = products.Where(p => p.Category == category).ToList();

        return Ok(products.Skip(skip).Take(take));
    }
}
```

---

## 🔍 Approach 5: Entity Framework Query Cache

### ⭐ Best For: Query-Level Caching, Complex Queries

### Using EF Core's Built-in Features

```csharp
// Compiled query caching (EF Core does automatically for LINQ queries)
public static class ProductQueries
{
    // Compile this query once, reuse multiple times
    private static readonly Func<ProductDbContext, int, Task<Product?>>
        GetProductById = EF.CompileAsyncQuery(
            (ProductDbContext context, int id) =>
            context.Products.FirstOrDefault(p => p.Id == id && p.IsActive)
        );

    public static async Task<Product?> GetProductByIdAsync(
        ProductDbContext context, int id)
    {
        return await GetProductById(context, id);
    }
}
```

---

## 🎯 Production Recommendations

### Development Setup

```
✓ Use: In-Memory Cache (IMemoryCache)
✓ Why: Fast setup, easy debugging, no dependencies
✓ Other: Add HTTP cache headers for API best practices

appsettings.Development.json:
{
  "Caching": {
    "Type": "InMemory",
    "DurationMinutes": 5
  }
}
```

### Single-Server Production

```
✓ Use: In-Memory Cache + HTTP Headers
✓ Why: No extra infrastructure needed, reasonable performance
✓ Setup takes: 10 minutes

Limitations:
✗ Cache lost on restart
✗ Can't scale to multiple servers
```

### Multi-Server Production

```
✓ Use: Redis + HTTP Headers + Middleware caching
✓ Why: Optimal performance, scalable, production-grade
✓ Setup takes: 30 minutes

Architecture:
├── Load Balancer
├── Server 1 → Redis
├── Server 2 → Redis  (shared cache)
└── Server 3 → Redis
```

### Enterprise Production

```
✓ Use: Redis + HTTP Headers + Response Middleware + EF Compiled Queries
✓ Add: CDN for static assets
✓ Add: Database query optimization
✓ Add: Monitoring & alerting

Setup:
├── CDN (Cloudflare, CloudFront)
├── Load Balancer
├── Multiple Servers
├── Redis Cluster (high availability)
├── Monitoring (New Relic, DataDog)
└── Alerting (Slack notifications)
```

---

## 🚀 Quick Implementation Checklist

### For Learning + Development: In-Memory Cache

**Time: 10 minutes**

```bash
☐ Step 1: Add builder.Services.AddMemoryCache() in Program.cs
☐ Step 2: Inject IMemoryCache in ProductService
☐ Step 3: Implement cache check in GetAll/GetById
☐ Step 4: Invalidate on Create/Update/Delete
☐ Step 5: Test and observe console output
```

### Add HTTP Cache Headers

**Time: 5 minutes**

```bash
☐ Step 1: Add [ResponseCache(...)] attributes on controllers
☐ Step 2: Test with curl: curl -i http://localhost:5000/api/products
☐ Step 3: Check for Cache-Control, ETag headers
```

### For Production: Add Redis

**Time: 30 minutes**

```bash
☐ Step 1: Install & run Redis
☐ Step 2: dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis
☐ Step 3: Configure in Program.cs
☐ Step 4: Inject IDistributedCache
☐ Step 5: Implement cache pattern
☐ Step 6: Test with multiple requests
```

---

## 📊 Performance Comparison

### Scenario: GET /api/products (100 products)

| Approach | First Request | Cached Request | Memory | Complexity |
|----------|---|---|---|---|
| **No Cache** | 100ms (DB) | 100ms (DB) | Low | ⭐ |
| **In-Memory** | 100ms | 1ms ✅ | Medium | ⭐⭐ |
| **Redis** | 100ms | 2ms | High | ⭐⭐⭐⭐ |
| **HTTP Headers** | 100ms | 0ms* ✅✅ | None | ⭐⭐ |
| **All Combined** | 100ms | 0.5ms ✅✅✅ | High | ⭐⭐⭐⭐⭐ |

*HTTP Headers: Browser cache, no network call

---

## 🎓 Key Takeaways

```
1. In-Memory = Fast but not persistent
2. Redis = Persistent and multi-server (enterprise choice)
3. HTTP Headers = Client-side caching (free performance)
4. Combine all for maximum efficiency
5. Always invalidate when data changes
6. Monitor cache hit rates in production
7. Measure performance gains
8. Don't cache everything (only valuable data)
```

---

**Next:** Implement In-Memory Cache + HTTP Headers for immediate gains!
