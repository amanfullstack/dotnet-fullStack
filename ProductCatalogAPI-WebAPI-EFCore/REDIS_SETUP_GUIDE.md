# 🔴 Redis Setup Guide - Distributed Caching

Complete guide for setting up Redis for distributed caching in ProductCatalogAPI.

---

## 📍 What is Redis?

```
Redis = Remote Dictionary Server

A fast, in-memory data store that acts as:
✓ Cache layer
✓ Session store
✓ Message broker
✓ Job queue
✓ Real-time database

Key Features:
✓ Sub-millisecond latency
✓ Stores on disk (persistence)
✓ Shared across servers (distributed)
✓ Survives application restarts
✓ Supports multiple data types
```

---

## 🚀 Installation Options

### Option 1: Docker (Recommended - Easiest)

**Prerequisite:** Docker installed on your machine

```bash
# Pull and run Redis as a container
docker run -d -p 6379:6379 --name my-redis redis:latest

# Verify it's running
docker ps

# Expected output:
# CONTAINER ID  IMAGE         COMMAND          STATUS
# abc123def456  redis:latest  redis-server     Up 2 minutes
```

**Stop Redis:**
```bash
docker stop my-redis
docker rm my-redis
```

---

### Option 2: Windows Subsystem for Linux (WSL)

**Step 1: Enable WSL**
```powershell
wsl --install
```

**Step 2: Install Redis in WSL**
```bash
wsl
sudo apt-get update
sudo apt-get install redis-server

# Start Redis
redis-server

# Or in background:
redis-server --daemonize yes
```

**Verify:**
```bash
redis-cli ping
# Output: PONG
```

---

### Option 3: Direct Windows Installation

**Option 3A: Using Chocolatey**
```powershell
choco install redis-64

# Start Redis:
C:\Program Files\Redis\redis-server.exe
```

**Option 3B: Manual Build**
```
Download: https://github.com/microsoftarchive/redis/releases
Extract to: C:\Redis\
Run: redis-server.exe
```

---

### Option 4: Redis Cloud (Managed Service)

```
Alternative: Use managed Redis service
Services:
✓ Azure Cache for Redis
✓ AWS ElastiCache
✓ Redis Cloud (cloud.redis.io)
✓ Heroku Redis

Pros:
✓ No infrastructure management
✓ Automatic backups
✓ High availability
✓ Global distribution

Cons:
✓ Monthly cost
✓ Network latency vs local
```

---

## 🔧 Verify Redis Installation

### Test Local Redis Connection

```bash
# In a terminal, connect to Redis CLI
redis-cli

# You should see:
# 127.0.0.1:6379>

# Test command
PING

# Expected output:
# PONG

# Get all keys
KEYS *

# Set a test value
SET test-key "hello"

# Get the value
GET test-key
# Output: "hello"

# Exit
EXIT
```

---

## 📦 ProductCatalogAPI Setup for Redis

### Step 1: Install NuGet Package

```bash
dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis
```

### Step 2: Update Program.cs

```csharp
using ProductCatalogAPI.Data;
using ProductCatalogAPI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

var builder = WebApplication.CreateBuilder(args);

// === CHOOSE ONE CACHING STRATEGY ===

// Option A: In-Memory Cache (Development)
//builder.Services.AddMemoryCache();

// Option B: Distributed Cache with Redis (Production)
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379";
    // For Azure Redis:
    // options.Configuration = "your-redis-name.redis.cache.windows.net:6380,password=XXX,ssl=True";
});

// === REST OF CONFIGURATION ===

// ... DbContext setup ...
builder.Services.AddScoped<IProductService, ProductService>();
// ... other services ...

var app = builder.Build();
// ... middleware ...
app.Run();
```

### Step 3: Update ProductService for Redis

**Switch from IMemoryCache to IDistributedCache:**

```csharp
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

public class ProductService : IProductService
{
    private readonly ProductDbContext _context;
    private readonly IDistributedCache _cache;  // Changed!

    public ProductService(ProductDbContext context, IDistributedCache cache)  // Changed!
    {
        _context = context;
        _cache = cache;  // Changed!
    }

    public async Task<List<Product>> GetAllProductsAsync()
    {
        const string cacheKey = "products-all";

        // Try to get from Redis (async!)
        var cachedData = await _cache.GetStringAsync(cacheKey);

        if (cachedData != null)
        {
            Console.WriteLine("✓ REDIS CACHE HIT");
            return JsonSerializer.Deserialize<List<Product>>(cachedData)!;
        }

        Console.WriteLine("✗ REDIS CACHE MISS: Fetching from database");

        var products = await _context.Products
            .Where(p => p.IsActive)
            .OrderBy(p => p.Name)
            .AsNoTracking()
            .ToListAsync();

        // Store in Redis (5-minute TTL)
        var cacheOptions = new DistributedCacheEntryOptions
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(5));

        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(products),
            cacheOptions
        );

        return products;
    }

    public async Task<Product> CreateProductAsync(Product product)
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

---

## 🔍 Redis Monitoring Commands

### Redis CLI Commands

```bash
redis-cli

# Connect to specific server
redis-cli -h localhost -p 6379

# Check server info
INFO

# Memory usage
INFO memory

# Get number of keys
DBSIZE

# Show all keys (warning: slow on large datasets!)
KEYS *

# Get specific key
GET my-key

# Delete specific key
DEL my-key

# Delete all keys
FLUSHALL

# Monitor all commands in real-time
MONITOR

# Get cache statistics
INFO stats

# Check connected clients
CLIENT LIST

# Exit
EXIT
```

---

## 🚨 Redis Best Practices

### 1. Connection Pool

```csharp
// Good: Connection string setup
var options = ConfigurationOptions.Parse("localhost:6379");
options.AllowAdmin = true;  // Admin commands
options.ConnectTimeout = 5000;
options.SyncTimeout = 5000;

builder.Services.AddStackExchangeRedisCache(opt =>
    opt.ConfigurationOptions = options
);
```

### 2. Error Handling

```csharp
public async Task<List<Product>> GetAllProductsAsync()
{
    try
    {
        var cached = await _cache.GetStringAsync("products-all");
        if (cached != null)
            return JsonSerializer.Deserialize<List<Product>>(cached)!;
    }
    catch (Exception ex)
    {
        // Redis unavailable - fall back to database
        _logger.LogWarning(ex, "Redis cache unavailable, using database");
    }

    // Database fallback
    var products = await _context.Products
        .Where(p => p.IsActive)
        .OrderBy(p => p.Name)
        .AsNoTracking()
        .ToListAsync();

    return products;
}
```

### 3. Key Naming Convention

```csharp
// Good: Namespaced, descriptive keys
const string KEY_ALL_PRODUCTS = "products:all";
const string KEY_PRODUCT = "product:{0}";  // product:123
const string KEY_CATEGORY = "products:category:{0}";  // products:category:electronics

// Use like:
string key = string.Format(KEY_PRODUCT, id);  // "product:123"
```

### 4. Expiration Strategy

```csharp
// Different TTLs for different data:

// Fast-moving data: 1-5 minutes
await _cache.SetStringAsync(key, data,
    new DistributedCacheEntryOptions
        .SetAbsoluteExpiration(TimeSpan.FromMinutes(1))
);

// Slow-changing data: 1-24 hours
await _cache.SetStringAsync(key, data,
    new DistributedCacheEntryOptions
        .SetAbsoluteExpiration(TimeSpan.FromHours(4))
);

// Never expires (admin data):
await _cache.SetStringAsync(key, data);  // No expiration
```

### 5. Monitoring & Metrics

```csharp
// Track cache hit/miss rates
public class CacheMetrics
{
    public int Hits { get; set; }
    public int Misses { get; set; }

    public decimal HitRate => (decimal)Hits / (Hits + Misses) * 100;
}

// In service:
private readonly CacheMetrics _metrics = new();

if (cachedData != null)
{
    _metrics.Hits++;
}
else
{
    _metrics.Misses++;
}
```

---

## 🔄 Migration: In-Memory → Redis

### Step 1: Both caches active (transition period)

```csharp
// Keep current in-memory cache working
builder.Services.AddMemoryCache();

// Add Redis alongside
builder.Services.AddStackExchangeRedisCache(options =>
    options.Configuration = "localhost:6379"
);

// Update service to use both:
public class ProductService
{
    private readonly IMemoryCache _memory;
    private readonly IDistributedCache _redis;

    public ProductService(IMemoryCache memory, IDistributedCache redis)
    {
        _memory = memory;
        _redis = redis;
    }

    // Use Redis as primary, memory as fallback
}
```

### Step 2: Complete migration

```csharp
// Remove IMemoryCache
// Keep only IDistributedCache with Redis

builder.Services.AddStackExchangeRedisCache(options =>
    options.Configuration = "localhost:6379"
);

public class ProductService
{
    private readonly IDistributedCache _cache;  // Only Redis

    public ProductService(IDistributedCache cache)
    {
        _cache = cache;
    }
}
```

---

## 📊 Redis vs In-Memory Comparison

| Feature | In-Memory (IMemoryCache) | Redis (IDistributedCache) |
|---------|---|---|
| **Persistence** | ❌ Lost on restart | ✅ Survives restarts |
| **Multi-Server** | ❌ No | ✅ Yes (shared) |
| **Speed** | ⭐⭐⭐⭐⭐ (in-process) | ⭐⭐⭐⭐ (network) |
| **Memory** | Uses app memory | Separate Redis server |
| **Scale** | Single machine ❌ | Multiple machines ✅ |
| **Setup** | Built-in ✅ | External service |
| **Cost** | Free | Free (self-hosted) or paid (cloud) |
| **Dev/Test** | Perfect ✅ | Complex |
| **Production** | Limited | Ideal ✅ |

---

## 🎯 Quick Start: Run Both Locally

### Terminal 1: Redis Server

```bash
# Using Docker
docker run -p 6379:6379 redis:latest

# Or direct (if installed)
redis-server
```

### Terminal 2: Your App

```bash
cd ProductCatalogAPI-WebAPI-EFCore

# Update Program.cs to use Redis
# (see code above)

dotnet run
```

### Terminal 3: Test

```bash
curl http://localhost:5000/api/products

# Check Redis contains cache:
redis-cli
keys *
# Should see: products-all

GET "products-all"
# Shows JSON array
```

---

## 🚀 Production Deployment: Azure Cache for Redis

### Setup Azure Redis

```powershell
# Create resource group
az group create --name ProductCatalogRG --location eastus

# Create Redis instance
az redis create --resource-group ProductCatalogRG \
  --name productcatalog-redis \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

### Get Connection String

```powershell
az redis list-keys --name productcatalog-redis --resource-group ProductCatalogRG
```

### Update appsettings.Production.json

```json
{
  "Redis": {
    "ConnectionString": "productcatalog-redis.redis.cache.windows.net:6380,password=YOUR_KEY,ssl=True"
  }
}
```

### Update Program.cs

```csharp
var redisConnection = builder.Configuration["Redis:ConnectionString"];

builder.Services.AddStackExchangeRedisCache(options =>
    options.Configuration = redisConnection
);
```

---

## 📝 Troubleshooting

### Issue: Connection Refused

```
Error: Connection refused at localhost:6379

Solution:
✓ redis-server -port 6379
✓ docker run -p 6379:6379 redis:latest
✓ Check firewall allowing port 6379
```

###Issue: Serialization Errors

```
Error: Cannot deserialize cached data

Solution:
✓ Clear cache: redis-cli FLUSHALL
✓ Restart app
✓ Check JSON serialization settings
```

### Issue: High Memory Usage

```
Solution:
✓ Set TTL on all cache entries
✓ Monitor KEYS with redis-cli INFO memory
✓ Increase Redis max-memory with eviction policy
✓ Use a more powerful Redis instance
```

---

## 🎓 Next Steps

1. Install Redis (Docker recommended)
2. Update Program.cs to use `AddStackExchangeRedisCache`
3. Update ProductService to use `IDistributedCache`
4. Update appsettings.json with Redis connection
5. Test with: `curl http://localhost:5000/api/products`
6. Monitor with: `redis-cli` in another terminal

---

**Reference:** [StackExchange.Redis Documentation](https://stackexchange.github.io/StackExchange.Redis/)
