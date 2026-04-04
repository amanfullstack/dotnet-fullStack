# Product Catalog API - Complete Documentation

## Overview

This is a complete ASP.NET Core REST API with Entity Framework Core for a Product Catalog CRUD application. The project demonstrates important architectural patterns and flows for building production-grade APIs.

## Project Structure

```
ProductCatalogAPI/
├── Models/                 # Data Models (Entity Classes)
│   └── Product.cs         # Product entity with database properties
├── Data/                  # Database Context & Configuration
│   └── ProductDbContext.cs  # EF Core DbContext with entity configuration
├── Services/              # Business Logic Layer
│   └── ProductService.cs  # CRUD operations and business rules
├── Controllers/           # API Endpoints
│   └── ProductsController.cs # HTTP endpoints (REST API)
├── Migrations/            # Database Migration Files
├── Program.cs             # Application Configuration & DI Setup
├── appsettings.json       # Configuration (connection string, logging)
└── api_documentation.md   # This file
```

## Important Flows

### FLOW #1: DATA MODEL (Models/Product.cs)

**What happens:** The Product class defines the structure of data.

**Key Points:**
- Each property maps to a database column
- `Id` is the primary key (auto-incremented by database)
- `Price` uses `decimal` for precise monetary values
- `CreatedDate` and `UpdatedDate` track data lifecycle
- `IsActive` implements soft delete (mark as inactive instead of removing)

**Why it matters:**
- Consistent data structure across the application
- Type safety (compiler catches errors at build time)
- Properties like `IsActive` enable audit trails

---

### FLOW #2: DATABASE CONTEXT (Data/ProductDbContext.cs)

**What happens:** DbContext bridges C# code and the database.

**Key Points:**
- Inherits from `DbContext` (EF Core base class)
- `DbSet<Product>` represents the Products table
- `OnModelCreating()` configures entity mappings
- Indexes on `Name` and `Category` for query performance
- Default values for timestamps (SQL Server `GETUTCDATE()`)

**Why it matters:**
- Single point where database schema is defined
- Configuration prevents migration mistakes
- Indexes improve query performance on large datasets

**Mapping Configuration Example:**
```csharp
entity.Property(p => p.Name)
    .IsRequired()
    .HasMaxLength(100)
    .HasColumnType("nvarchar(100)");
```

---

### FLOW #3: SERVICE LAYER (Services/ProductService.cs)

**What happens:** Services contain all business logic and CRUD operations.

**Key Points:**

#### **CREATE Flow:**
```
1. Receive Product object from controller
2. Set timestamps (CreatedDate, UpdatedDate = UtcNow)
3. Mark as active (IsActive = true)
4. Add to DbContext (change tracker monitors it)
5. Call SaveChangesAsync() → Database INSERT
6. Return product with generated ID
```

#### **READ (Get All) Flow:**
```
1. Query all products where IsActive = true
2. Use AsNoTracking() (read-only, better performance)
3. Order by Name for consistent results
4. ToListAsync() executes query asynchronously
5. Return List<Product>
```

#### **READ (Get By ID) Flow:**
```
1. Use FindAsync(id) - optimized for primary key lookup
2. Check if exists AND IsActive = true
3. Return product or null
```

#### **UPDATE Flow:**
```
1. Fetch existing product from database via FindAsync()
2. Verify found and active
3. Update properties (except Id and CreatedDate)
4. Update UpdatedDate = UtcNow
5. Call SaveChangesAsync() → Database UPDATE
6. Return updated product
```

#### **DELETE Flow (Soft Delete):**
```
1. Fetch product by ID
2. Check if exists and active
3. Mark IsActive = false (SOFT DELETE - data preserved)
4. Update UpdatedDate
5. Call SaveChangesAsync() → Database UPDATE
6. Return success indicator
```

**Why Soft Delete?**
- Data is preserved (required for auditing/compliance)
- Can restore deleted items if needed
- Hard delete: `context.Products.Remove(product)`

---

### FLOW #4: API CONTROLLER (Controllers/ProductsController.cs)

**What happens:** Controllers handle HTTP requests and delegate to services.

**Key Points:**

#### **Dependency Injection:**
```csharp
public ProductsController(IProductService productService, ILogger<ProductsController> logger)
{
    _productService = productService; // Injected by ASP.NET Core
    _logger = logger;
}
```
- Services are injected via constructor
- Loose coupling: Controller depends on interface, not implementation
- Testable: Can inject mock service for unit tests

#### **HTTP POST (Create):**
```
Request:  POST /api/products
Body:     { "name": "Laptop", "price": 999.99, ... }
          ↓
          [Model Binding] ASP.NET Core deserializes JSON
          ↓
          Validation (name required, price > 0)
          ↓
          Service.CreateProductAsync()
          ↓
Response: 201 Created + Location header
          { "id": 1, "name": "Laptop", ... }
```

#### **HTTP GET (Read All):**
```
Request:  GET /api/products
          ↓
          Service.GetAllProductsAsync()
          ↓
          Database Query: SELECT * FROM Products WHERE IsActive = 1
          ↓
Response: 200 OK
          [ { "id": 1, ... }, { "id": 2, ... } ]
```

#### **HTTP GET by ID (Read Single):**
```
Request:  GET /api/products/1
          ↓
          Route binding extracts id = 1
          ↓
          Service.GetProductByIdAsync(1)
          ↓
Response: 200 OK + Body OR 404 Not Found
```

#### **HTTP PUT (Update):**
```
Request:  PUT /api/products/1
Body:     { "name": "Updated Laptop", "price": 899.99, ... }
          ↓
          Find product with ID=1
          ↓
          Update properties
          ↓
          Service.UpdateProductAsync(1, updatedProduct)
          ↓
Response: 200 OK + Updated product
```

#### **HTTP DELETE:**
```
Request:  DELETE /api/products/1
          ↓
          Service.DeleteProductAsync(1)
          ↓
          Mark IsActive = false
          ↓
Response: 204 No Content (success, empty body)
```

#### **HTTP PATCH (Update Stock):**
```
Request:  PATCH /api/products/1/stock
Body:     { "quantityAdjustment": 5 }  // +5 units
          ↓
          Service.UpdateStockAsync(1, 5)
          ↓
          Validate stock won't go negative
          ↓
Response: 200 OK + Updated product
```

---

### FLOW #5: DEPENDENCY INJECTION & CONFIGURATION (Program.cs)

**What happens:** Application setup and service registration.

**Key Points:**

```csharp
// Add DbContext with SQL Server
builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseSqlServer(connectionString)
);

// Register business logic service
// Scoped: One instance per HTTP request (ideal for DbContext)
builder.Services.AddScoped<IProductService, ProductService>();

// Enable CORS for React (port 3000) and Angular (port 4200)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000", "http://localhost:4200")
});
```

**Service Lifetime Options:**
- **Transient**: New instance every time (stateless utilities)
- **Scoped**: One per HTTP request (DbContext, services)
- **Singleton**: One for entire application (configuration, logging)

---

### FLOW #6: HTTP REQUEST PIPELINE (Program.cs)

**What happens:** How a request flows through middleware.

```
HTTP Request
    ↓
[CORS Middleware] ← Check if origin is allowed
    ↓
[Routing] ← Match URL to controller route
    ↓
[Model Binding] ← Deserialize JSON to C# objects
    ↓
[Controller Action] ← Execute CreateProduct(), GetAllProducts(), etc.
    ↓
    Call Service.xyz() ← Business logic
    ↓
    Service → Repository → DbContext → Database
    ↓
[Response] ← Return 200, 201, 404, etc.
    ↓
HTTP Response
```

---

## Database Schema

```sql
CREATE TABLE [Products] (
    [Id] int NOT NULL IDENTITY,                  -- Primary Key, auto-increment
    [Name] nvarchar(100) NOT NULL,               -- Product name
    [Description] nvarchar(500) NOT NULL,        -- Details
    [Price] decimal(10,2) NOT NULL,              -- Price: ###,###.##
    [StockQuantity] int NOT NULL,                -- Units available
    [Category] nvarchar(50) NOT NULL,            -- Product category
    [CreatedDate] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedDate] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [IsActive] bit NOT NULL                      -- Soft delete flag
);

CREATE INDEX [IX_Product_Category] ON [Products] ([Category]);
CREATE INDEX [IX_Product_Name] ON [Products] ([Name]);
```

---

## How to Run

### Prerequisites
- .NET 8 SDK
- SQL Server (LocalDB comes with Visual Studio)

### Steps

1. **Build the project:**
   ```bash
   dotnet build
   ```

2. **Create database (if not already done):**
   ```bash
   dotnet ef database update
   ```

3. **Run the API:**
   ```bash
   dotnet run
   ```
   - API runs on: `http://localhost:5000`
   - Swagger UI: `http://localhost:5000/swagger`

---

## API Endpoints

### Create Product
```
POST /api/products
Content-Type: application/json

{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "stockQuantity": 10,
  "category": "Electronics"
}

Response: 201 Created
{
  "id": 1,
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "stockQuantity": 10,
  "category": "Electronics",
  "createdDate": "2026-04-04T13:40:00",
  "updatedDate": "2026-04-04T13:40:00",
  "isActive": true
}
```

### Get All Products
```
GET /api/products

Response: 200 OK
[
  { "id": 1, "name": "Laptop", ... },
  { "id": 2, "name": "Mouse", ... }
]
```

### Get Product by ID
```
GET /api/products/1

Response: 200 OK
{ "id": 1, "name": "Laptop", ... }

Or: 404 Not Found
```

### Get Products by Category
```
GET /api/products/category/Electronics

Response: 200 OK
[
  { "id": 1, "name": "Laptop", ... },
  { "id": 3, "name": "Monitor", ... }
]
```

### Update Product
```
PUT /api/products/1
Content-Type: application/json

{
  "name": "Updated Laptop",
  "description": "Even better",
  "price": 899.99,
  "stockQuantity": 15,
  "category": "Electronics"
}

Response: 200 OK
{ "id": 1, "name": "Updated Laptop", ... }
```

### Delete Product
```
DELETE /api/products/1

Response: 204 No Content
(Empty body)
```

### Update Stock
```
PATCH /api/products/1/stock
Content-Type: application/json

{
  "quantityAdjustment": 5
}

Response: 200 OK
{ "id": 1, "stockQuantity": 20, ... }
```

---

## Key Concepts for Learning

### 1. **Async/Await**
All database operations use `async/await` for non-blocking I/O:
```csharp
var product = await _productService.GetProductByIdAsync(id);
```
- Doesn't block thread while waiting for database
- Improves application scalability

### 2. **Entity Framework Core (ORM)**
Converts C# code to SQL automatically:
```csharp
// C# Code
var products = await _context.Products
    .Where(p => p.IsActive && p.Category == "Electronics")
    .ToListAsync();

// Generated SQL
SELECT * FROM Products WHERE IsActive = 1 AND Category = 'Electronics'
```

### 3. **Change Tracking**
EF Core tracks object changes automatically:
```csharp
var product = await _context.Products.FindAsync(1);
product.Price = 899.99;  // EF Core knows this changed
await _context.SaveChangesAsync();  // Generates UPDATE
```

### 4. **Data Transfer Objects (DTOs)**
Request/Response models separate API contract from database model:
```csharp
// Request DTO
public class CreateProductRequest
{
    public string Name { get; set; }
    public decimal Price { get; set; }
}

// Entity (Database Model)
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public DateTime CreatedDate { get; set; }
}
```
- Allows changing database without breaking API
- Better security (don't expose internal fields)

### 5. **Dependency Injection (DI)**
Framework automatically provides dependencies:
```csharp
// Service is injected
public ProductsController(IProductService service) { }

// ASP.NET Core creates instance and passes it
ProductsController controller = new ProductsController(
    new ProductService(dbContext)
);
```
- Loose coupling
- Easy to test (inject mock)
- Dependencies managed centrally

---

## Next Steps: Frontend Integration

This API is ready for frontend frameworks:

### **React (http://localhost:3000)**
```javascript
// Fetch all products
const response = await fetch('http://localhost:5000/api/products');
const products = await response.json();

// Create product
const newProduct = await fetch('http://localhost:5000/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'New Product',
        price: 29.99,
        category: 'Electronics'
    })
});
```

### **Angular (http://localhost:4200)**
```typescript
// HttpClient automatically calls the API
constructor(private http: HttpClient) {}

getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:5000/api/products');
}

createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>('http://localhost:5000/api/products', product);
}
```

---

## Advanced Topics (Coming Later)

1. **Validation** - Data validation rules
2. **Exception Handling** - Global error handling middleware
3. **Logging** - Structured logging with Serilog
4. **Authentication** - JWT tokens, identity management
5. **Authorization** - Role-based access control
6. **Caching** - Distributed caching with Redis
7. **Pagination** - Large dataset handling
8. **API Versioning** - Multiple API versions
9. **Unit Testing** - xUnit, Moq frameworks
10. **Integration Testing** - Testing with real database

---

## Important Code Patterns

### Pattern 1: Service Injection
```csharp
public class ProductsController : ControllerBase
{
    // Injected in constructor, not instantiated manually
    private readonly IProductService _service;

    public ProductsController(IProductService service)
    {
        _service = service;  // DI Container provides this
    }
}
```

### Pattern 2: CRUD Operations
```csharp
// CREATE
var product = await _service.CreateProductAsync(newProduct);

// READ
var product = await _service.GetProductByIdAsync(id);

// UPDATE
var updated = await _service.UpdateProductAsync(id, product);

// DELETE
await _service.DeleteProductAsync(id);
```

### Pattern 3: Error Handling
```csharp
try
{
    var product = await _service.GetProductByIdAsync(id);
    if (product == null) return NotFound();
    return Ok(product);
}
catch (Exception ex)
{
    _logger.LogError(ex, "Error retrieving product");
    return StatusCode(500, "Internal server error");
}
```

---

## Summary

This API demonstrates:
✅ Clean Architecture (Models → Services → Controllers)
✅ Dependency Injection for loose coupling
✅ Entity Framework Core for data access
✅ RESTful API design principles
✅ Async/await for performance
✅ Soft deletes for data preservation
✅ Input validation and error handling
✅ Logging for debugging
✅ CORS for frontend integration

You can replicate this patterns with **ASP.NET MVC**, **Minimal APIs**, or advance it with authentication, advanced queries, and more.
