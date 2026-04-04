# ASP.NET Core Web API - Learning Guide

## Quick Start

```bash
# 1. Run the application
dotnet run

# 2. API runs on http://localhost:5000
# 3. Swagger UI: http://localhost:5000/swagger

# 4. In another terminal, test endpoints
# Use ProductCatalogAPI.http file in VS Code
# Click "Send Request" buttons above each endpoint
```

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│         HTTP REQUEST from Client                │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│     ProductsController (Controllers/)           │
│  - Handles HTTP requests/responses              │
│  - Validates input                              │
│  - Returns appropriate HTTP status codes        │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓ Delegates business logic
┌─────────────────────────────────────────────────┐
│     ProductService (Services/)                  │
│  - CRUD operations                              │
│  - Business rules                               │
│  - Calls database                               │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓ Uses DbContext
┌─────────────────────────────────────────────────┐
│  ProductDbContext (Data/)                       │
│  - Represents database                          │
│  - Tracks entity changes                        │
│  - Executes queries                             │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│        SQL Server Database                      │
│  (ProductCatalogDB.mdf)                         │
└─────────────────────────────────────────────────┘
```

## Key Component Explanations

### 1. Models (Product.cs)
**Purpose:** Define data structure
**Code Example:**
```csharp
public class Product
{
    public int Id { get; set; }              // Primary Key
    public string Name { get; set; }         // Product name
    public decimal Price { get; set; }       // Price (10,2 means $999.99)
    public int StockQuantity { get; set; }   // Units available
    public DateTime CreatedDate { get; set; } // When created
    public bool IsActive { get; set; }       // Soft delete flag
}
```

### 2. DbContext (ProductDbContext.cs)
**Purpose:** Bridge between C# and database
**Code Example:**
```csharp
public class ProductDbContext : DbContext
{
    public DbSet<Product> Products { get; set; }  // Represents table

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure how Product maps to database
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(p => p.Id);                    // Primary key
            entity.Property(p => p.Price)
                .HasPrecision(10, 2);                    // Decimal precision
            entity.HasIndex(p => p.Category);            // Index for queries
        });
    }
}
```

### 3. Service Layer (ProductService.cs)
**Purpose:** Contains business logic
**Code Example:**
```csharp
public class ProductService : IProductService
{
    private readonly ProductDbContext _context;

    public ProductService(ProductDbContext context)
    {
        _context = context;
    }

    //  CREATE
    public async Task<Product> CreateProductAsync(Product product)
    {
        product.CreatedDate = DateTime.UtcNow;
        _context.Products.Add(product);
        await _context.SaveChangesAsync();  // Database INSERT
        return product;
    }

    // READ ALL
    public async Task<List<Product>> GetAllProductsAsync()
    {
        return await _context.Products
            .Where(p => p.IsActive)                     // Only active
            .OrderBy(p => p.Name)
            .AsNoTracking()                             // Read-only
            .ToListAsync();
    }

    // UPDATE
    public async Task<Product?> UpdateProductAsync(int id, Product product)
    {
        var existing = await _context.Products.FindAsync(id);
        if (existing == null) return null;

        existing.Name = product.Name;
        existing.Price = product.Price;
        existing.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();  // Database UPDATE
        return existing;
    }

    // DELETE (Soft)
    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return false;

        product.IsActive = false;  // Mark as deleted
        await _context.SaveChangesAsync();
        return true;
    }
}
```

### 4. Controller (ProductsController.cs)
**Purpose:** Handle HTTP requests
**Code Example:**
```csharp
[ApiController]
[Route("api/[controller]")]  // Route: /api/products
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    // Dependency Injection
    public ProductsController(IProductService service)
    {
        _service = service;
    }

    // POST /api/products
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(CreateProductRequest request)
    {
        var product = new Product
        {
            Name = request.Name,
            Price = request.Price,
            Category = request.Category
        };

        var created = await _service.CreateProductAsync(product);
        return CreatedAtAction(nameof(GetProductById),
            new { id = created.Id }, created);  // Returns 201
    }

    // GET /api/products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetAllProducts()
    {
        var products = await _service.GetAllProductsAsync();
        return Ok(products);  // Returns 200
    }

    // GET /api/products/1
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProductById(int id)
    {
        var product = await _service.GetProductByIdAsync(id);
        if (product == null)
            return NotFound();  // Returns 404
        return Ok(product);     // Returns 200
    }

    // PUT /api/products/1
    [HttpPut("{id}")]
    public async Task<ActionResult<Product>> UpdateProduct(int id, UpdateProductRequest request)
    {
        var product = new Product { /* ... */ };
        var updated = await _service.UpdateProductAsync(id, product);
        if (updated == null)
            return NotFound();
        return Ok(updated);  // Returns 200
    }

    // DELETE /api/products/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var success = await _service.DeleteProductAsync(id);
        if (!success)
            return NotFound();
        return NoContent();  // Returns 204
    }
}
```

### 5. Dependency Injection Setup (Program.cs)
**Purpose:** Register services for automatic injection
**Code Example:**
```csharp
var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseSqlServer(connectionString)
);

// Register service
// Scoped = one instance per request
builder.Services.AddScoped<IProductService, ProductService>();

// Enable CORS for React/Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000", "http://localhost:4200")
    );
});

var app = builder.Build();
app.UseCors("AllowFrontend");
app.MapControllers();
app.Run();
```

## HTTP Status Codes Your API Returns

| Code | Meaning | When | Example |
|------|---------|------|---------|
| 200 | OK | Successful GET, PUT | GET /api/products/1 |
| 201 | Created | Successful POST | POST /api/products |
| 204 | No Content | Successful DELETE | DELETE /api/products/1 |
| 400 | Bad Request | Invalid input | POST with price = 0 |
| 404 | Not Found | Resource doesn't exist | GET /api/products/999 |
| 500 | Server Error | Unexpected exception | Database connection fails |

## Database Flow

### CREATE (INSERT)
```
Request:  POST /api/products with { "name": "Laptop", ... }
          ↓
Service:  new Product { Name = "Laptop", ... }
          _context.Products.Add(product)
          ↓
DbContext: Tracks it as "Added" entity
          ↓
SaveAsync: Generates: INSERT INTO Products (Name, ...) VALUES ('Laptop', ...)
          ↓
Response: 201 + { "id": 1, "name": "Laptop", ... }
```

### READ (SELECT)
```
Request:  GET /api/products
          ↓
Service:  _context.Products.Where(p => p.IsActive).ToListAsync()
          ↓
DbContext: Generates: SELECT * FROM Products WHERE IsActive = 1
          ↓
Response: 200 + [ { "id": 1, ... }, { "id": 2, ... } ]
```

### UPDATE (UPDATE)
```
Request:  PUT /api/products/1 with { "price": 899.99 }
          ↓
Service:  product = FindAsync(1)
          product.Price = 899.99
          ↓
DbContext: Detects change in "Tracked" entity
          ↓
SaveAsync: Generates: UPDATE Products SET Price = 899.99 WHERE Id = 1
          ↓
Response: 200 + { "id": 1, "price": 899.99, ... }
```

### DELETE (SOFT DELETE)
```
Request:  DELETE /api/products/1
          ↓
Service:  product = FindAsync(1)
          product.IsActive = false  (NOT removed from DB!)
          ↓
DbContext: Detects change
          ↓
SaveAsync: Generates: UPDATE Products SET IsActive = 0 WHERE Id = 1
          ↓
Response: 204 No Content (data still in database)
```

## Testing the API

### Option 1: Use VS Code REST Client
1. Open `ProductCatalogAPI.http`
2. Click "Send Request" above each request
3. See response below each request

### Option 2: Use Swagger UI
1. Run: `dotnet run`
2. Open: `http://localhost:5000/swagger`
3. Click "Try it out" on each endpoint

### Option 3: Use Postman
1. POST `http://localhost:5000/api/products`
2. Body: `{ "name": "Laptop", "price": 999.99, ... }`
3. Send

### Option 4: Use cURL
```bash
# Create
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999.99,"category":"Electronics","stockQuantity":10,"description":""}'

# Get all
curl http://localhost:5000/api/products

# Get by ID
curl http://localhost:5000/api/products/1

# Update
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Laptop","price":899.99,"category":"Electronics","stockQuantity":15,"description":""}'

# Delete
curl -X DELETE http://localhost:5000/api/products/1
```

## Important Concepts

### Why Interfaces (IProductService)?
```csharp
// Interface
public interface IProductService
{
    Task<Product> CreateProductAsync(Product product);
}

// Implementation
public class ProductService : IProductService
{
    public async Task<Product> CreateProductAsync(Product product)
    {
        // actual code
    }
}

// Benefits:
// 1. Controller depends on abstraction, not concrete class
// 2. Easy to swap implementations: test vs production
// 3. Can create mock service for unit tests
```

### Why Async/Await?
```csharp
// Synchronous (blocking - bad for scalability)
var product = _context.Products.Find(1);

// Asynchronous (non-blocking - good for scalability)
var product = await _context.Products.FindAsync(1);

// Async doesn't block thread while waiting for DB
// Other requests can use freed thread
// Servers can handle more concurrent requests
```

### Why Soft Delete?
```csharp
// Soft Delete (preserve data)
product.IsActive = false;
await _context.SaveChangesAsync();  // UPDATE IsActive = 0

// Hard Delete (remove permanently)
_context.Products.Remove(product);
await _context.SaveChangesAsync();  // DELETE FROM Products WHERE Id = 1

// Use soft delete when:
// - Need audit trail (who deleted what, when)
// - May need to restore deleted data
// - Compliance requirements
```

## File Structure Overview

```
ProductCatalogAPI/
├── Models/
│   └── Product.cs               ← Data model
├── Data/
│   └── ProductDbContext.cs      ← Database configuration
├── Services/
│   └── ProductService.cs        ← Business logic
├── Controllers/
│   └── ProductsController.cs    ← HTTP endpoints
├── Migrations/                  ← Auto-generated DB migrations
├── Program.cs                   ← App configuration & DI
├── appsettings.json             ← Settings (connection string)
├── ProductCatalogAPI.http       ← Test requests
└── API_DOCUMENTATION.md         ← Full documentation
```

## Next Learning Steps

1. **Add Validation** - Validate inputs (e.g., Price > 0)
2. **Add Logging** - Log errors and important operations
3. **Add Authentication** - JWT tokens, user identity
4. **Add Unit Tests** - xUnit, Moq, test services
5. **Add React Frontend** - Call this API from React
6. **Add Advanced Queries** - Search, filtering, pagination
7. **Add Caching** - Redis for performance
8. **Deploy** - Azure, AWS, or Docker

## Summary

This API demonstrates the **foundation of modern web applications**:

✅ **N-Tier Architecture** - Layered approach (Controller → Service → DbContext → Database)
✅ **RESTful API** - Standard HTTP methods (GET, POST, PUT, DELETE)
✅ **Dependency Injection** - Loose coupling, testability
✅ **Entity Framework Core** - ORM for database access
✅ **Asynchronous Operations** - Non-blocking, scalable
✅ **Error Handling** - Try-catch, validation, HTTP status codes
✅ **Clean Code** - Self-documenting, maintainable patterns

These concepts apply across:
- Web APIs
- ASP.NET MVC
- ASP.NET Blazor
- Microservices
- Any modern .NET application
