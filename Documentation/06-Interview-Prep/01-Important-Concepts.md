# 🎯 Interview Preparation - Important Concepts

Key concepts you MUST know for technical interviews about .NET/Web APIs.

---

## 1️⃣ N-Tier Architecture

### What is it?
Separating application into logical layers:
- **Presentation Layer** (Controllers) - Handles HTTP requests
- **Business Logic Layer** (Services) - Core functionality
- **Data Access Layer** (DbContext) - Database queries
- **Database Layer** - Persistent storage

### Why use it?
```
✅ Separation of Concerns - Each layer has single responsibility
✅ Testability - Can test each layer independently
✅ Maintainability - Changes in one layer don't affect others
✅ Reusability - Services can be used by multiple controllers
✅ Scalability - Can optimize each layer separately
```

### Example Flow
```
User Request
    ↓
[Controller] - Validates input, calls service
    ↓
[Service] - Business logic, validation
    ↓
[DbContext] - Queries database
    ↓
[Database] - Returns data
    ↓
Response back up the chain
```

### Interview Question
**Q: "Why use N-Tier architecture?"**

**A:** "N-Tier architecture separates concerns into logical layers. Each layer has a single responsibility: Controllers handle HTTP, Services handle business logic, and DbContext handles data access. This makes the code easier to test, maintain, and scale. For example, I can test the service layer without needing a database by mocking the DbContext."

---

## 2️⃣ Dependency Injection (DI)

### What is it?
Providing dependencies to a class from outside, rather than creating them internally.

```csharp
// WITHOUT DI (Tightly Coupled)
public class ProductService
{
    private DbContext context = new DbContext();  // Created internally
}

// WITH DI (Loosely Coupled)
public class ProductService
{
    private DbContext context;

    public ProductService(DbContext context)  // Injected from outside
    {
        this.context = context;
    }
}
```

### Benefits
```
✅ Loose Coupling - Classes don't create dependencies
✅ Testability - Easy to inject mock objects
✅ Flexibility - Can swap implementations
✅ Single Source - DI container manages instances
```

### ASP.NET Core DI Lifetimes
```csharp
// Transient: New instance every time
services.AddTransient<IService, Service>();

// Scoped: One instance per HTTP request (recommended for DbContext)
services.AddScoped<IService, Service>();

// Singleton: One instance for application lifetime
services.AddSingleton<IService, Service>();
```

### Interview Question
**Q: "Explain dependency injection and why it's important"**

**A:** "Dependency Injection is passing dependencies to a class from outside rather than the class creating them. It's important because it creates loose coupling between classes, making code more testable and maintainable. In ASP.NET Core, I can register services in Program.cs with different lifetimes: Scoped (recommended for DbContext - one per request), Transient (new each time), or Singleton (one for application). This allows me to easily mock dependencies in tests and swap implementations without changing the consuming class."

---

## 3️⃣ Async/Await

### What is it?
Non-blocking programming model that allows operations to complete without blocking the thread.

```csharp
// Synchronous (blocks thread while waiting)
public Product GetProduct(int id)
{
    return database.Query($"SELECT * FROM Products WHERE Id = {id}");
}

// Asynchronous (releases thread while waiting)
public async Task<Product> GetProductAsync(int id)
{
    return await database.QueryAsync($"SELECT * FROM Products WHERE Id = {id}");
}
```

### Why Important
```
✅ Scalability - Server can handle more concurrent requests
✅ Responsiveness - UI doesn't freeze
✅ Resource Efficiency - Threads can do other work
✅ Better Performance - Under high load
```

### Example
```
Without Async (Blocks 100 threads for 100ms each):
  Thread 1: [###########] 100ms
  Thread 2: [###########] 100ms
  Total: 100ms per request × 100 requests = 10 seconds

With Async (All 100 requests on 10 threads):
  Thread 1: ####  ####  ####  ... (switches between requests)
  Thread 2: ####  ####  ####  ...
  Total: 100ms for all 100 requests
```

### Interview Question
**Q: "Why use async/await in ASP.NET Core?"**

**A:** "Async/await allows non-blocking I/O operations. When a thread is waiting for database or network I/O, instead of blocking the thread, it releases it to handle other requests. This dramatically improves scalability. With async, one thread can handle multiple concurrent requests by switching between them while waiting for I/O. Without async, each request would block a thread, limiting the server to the thread pool size. This is crucial for web applications that need to handle many concurrent users."

---

## 4️⃣ Caching

### What is it?
Storing frequently accessed data in fast memory to avoid expensive operations (DB queries).

### Approaches
```
1. In-Memory Cache (IMemoryCache)
   - Stored in application memory
   - Fast (sub-millisecond)
   - Lost on app restart
   - Not shared across servers

2. HTTP Cache Headers
   - Browser caches responses
   - Zero network for repeat requests
   - Controlled by Cache-Control headers
   - 304 Not Modified responses

3. Distributed Cache (Redis)
   - Shared across multiple servers
   - Survives app restarts
   - Network latency
   - Production-ready

4. Response Caching Middleware
   - Caches responses at middleware level
   - Works with HTTP headers
   - Automatic invalidation features
```

### Performance Impact
```
Without Cache: 100 requests = 100 × 150ms = 15 seconds
With Cache: 100 requests = 1 × 150ms + 99 × 1ms = 150ms

Result: 100x FASTER!
```

### Cache Invalidation
⚠️ **Most important**: When data changes, clear the cache!

```csharp
// Without invalidation = stale data bug!
cache.Set("products-all", products);  // Cached
// ... time passes ...
// New product created, but cache still has old list ❌

// With invalidation = always fresh
cache.Remove("products-all");  // Clear when data changes ✅
```

### Interview Question
**Q: "How would you implement caching? What are the challenges?"**

**A:** "I would implement caching at multiple levels: First, in-memory cache in the service layer for speed. Second, HTTP cache headers for browser caching. Third, Redis for multi-server setups. The main challenge is cache invalidation - keeping cached data fresh. I would invalidate cache when data is created, updated, or deleted. Another challenge is choosing what to cache - high-read, low-write data like category lists are good. Low-read data or rapidly changing data should not be cached. I would also implement cache expiration with TTL (Time To Live) - for example, clearing items after 5 minutes - as a safety net."

---

## 5️⃣ RESTful API Design

### HTTP Methods
```
GET    - Retrieve data (safe, idempotent)
POST   - Create new data
PUT    - Replace entire resource
PATCH  - Update part of resource
DELETE - Remove data
```

### Status Codes
```
2xx - Success
  200 OK
  201 Created (POST creates new)
  204 No Content (successful but no data to return)

3xx - Redirection
  304 Not Modified (cache still valid)

4xx - Client Error
  400 Bad Request
  404 Not Found
  409 Conflict (duplicate, version mismatch)

5xx - Server Error
  500 Internal Server Error
```

### RESTful Principles
```
✅ Resource-based URLs: /api/products, /api/products/123
✅ Standard HTTP methods: GET, POST, PUT, DELETE
✅ Stateless: Each request contains all needed information
✅ Representations: JSON/XML representations of resources
✅ HATEOAS: Links in responses for navigation (optional)
```

### Example
```
GET    /api/products           → Get all
POST   /api/products           → Create one (201)
GET    /api/products/{id}      → Get specific
PUT    /api/products/{id}      → Update
DELETE /api/products/{id}      → Delete (204)
PATCH  /api/products/{id}/stock → Partial update
```

### Interview Question
**Q: "What makes an API truly RESTful?"**

**A:** "A RESTful API follows these principles: first, it's resource-based - URLs represent resources like /api/products, not actions. Second, it uses standard HTTP methods correctly - GET for retrieval, POST for creation, PUT for updates, DELETE for removal. Each request should be stateless, containing all needed context. HTTP status codes should be used correctly - 200 OK, 201 Created, 404 Not Found, etc. The API should use appropriate content types - typically JSON. Responses should include only necessary data to minimize payload size. These principles make APIs predictable, easy to use, and scalable."

---

## 6️⃣ Entity Framework Core

### What is it?
ORM (Object-Relational Mapper) that translates C# objects to database queries.

```csharp
// You write C#
var products = await context.Products
    .Where(p => p.Price > 100)
    .OrderBy(p => p.Name)
    .ToListAsync();

// EF translates to SQL
SELECT * FROM Products WHERE Price > 100 ORDER BY Name
```

### Key Concepts
```
DbContext - Represents database session
DbSet - Represents a table
LINQ - Query syntax
Change Tracking - Tracks object modifications
Migration - Database schema changes
```

### Change Tracking
```csharp
var product = context.Products.FirstAsync(p => p.Id == 1);
product.Price = 99.99;  // Modified property
await context.SaveChangesAsync();  // EF detects change, generates UPDATE

// For read-only queries, disable tracking
var products = context.Products.AsNoTracking().ToListAsync();
```

### Interview Question
**Q: "What is Entity Framework and why use it?"**

**A:** "Entity Framework Core is an ORM that maps database tables to C# objects. Instead of writing SQL, I write LINQ queries that EF translates to SQL. Benefits include: reduced SQL code, type safety, automatic change tracking, and simplified relationships. EF manages the mapping between database and objects. I can use code-first migrations to version database schema. However, for complex queries or performance-critical code, raw SQL is sometimes better. I should also be aware of performance pitfalls like N+1 queries - using Include() for related data or AsNoTracking() for read-only queries improves performance."

---

## Summary: Quick Answers

| Concept | Quick Answer |
|---------|--------------|
| **N-Tier** | Separate layers: Controllers→Services→DbContext→Database |
| **DI** | Inject dependencies instead of creating them; enables testing |
| **Async/Await** | Non-blocking I/O; handles more concurrent users |
| **Caching** | Store data in fast memory; invalidate when changed |
| **REST** | Resource-based URLs, standard HTTP methods, stateless |
| **EF** | ORM that maps objects to database tables |

---

🎓 **Master these 6 concepts and you'll crush the technical interview!**
