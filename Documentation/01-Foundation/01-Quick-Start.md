# 🚀 Product Catalog API - Quick Start Guide

## ✅ What Was Built

A complete **ASP.NET Core 8.0 REST API** with **Entity Framework Core** demonstrating essential CRUD and architectural patterns:

```
Controllers → Services → DbContext → SQL Server Database
```

## 📁 Project Structure

```
ProductCatalogAPI/
│
├── Models/
│   └── Product.cs                  # Entity: Id, Name, Description, Price, StockQuantity, Category
│
├── Data/
│   └── ProductDbContext.cs         # EF Core DbContext with entity configuration
│
├── Services/
│   └── ProductService.cs           # Business logic: CRUD operations, validations
│
├── Controllers/
│   └── ProductsController.cs       # REST API endpoints (POST, GET, PUT, DELETE, PATCH)
│
├── Migrations/
│   └── [Auto-generated migration files]  # Database schema migrations
│
├── Program.cs                       # App configuration & Dependency Injection setup
├── appsettings.json                 # Connection strings & settings
├── ProductCatalogAPI.http           # API test requests (for VS Code)
├── API_DOCUMENTATION.md             # Complete documentation with all flows
├── LEARNING_GUIDE.md                # Educational guide with code examples
└── README.md                        # This file
```

## 🔥 Key Features

✅ **6 REST Endpoints:**
- `POST /api/products` - Create new product
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/category/{category}` - Filter by category
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product (soft delete)
- `PATCH /api/products/{id}/stock` - Update inventory

✅ **Important Concepts:**
- Clean **N-Tier Architecture** (layered approach)
- **Dependency Injection** for loose coupling
- **Async/await** for scalability
- **Soft Delete** pattern (data preservation)
- **Entity Framework Core** ORM
- **CORS** configured for React/Angular
- **Swagger UI** for API documentation
- **Comprehensive comments** explaining important flows

## 🚀 Run the API

### Step 1: Build the project
```bash
cd d:\dotnet-fullStack
dotnet build
```

### Step 2: Start the API
```bash
dotnet run
```
- API runs on: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`

### Step 3: Test endpoints

#### Option A: VS Code REST Client
1. Open `ProductCatalogAPI.http`
2. Click "Send Request" above each API call
3. See response below

#### Option B: Swagger UI
1. Go to `http://localhost:5000/swagger`
2. Click "Try it out" on any endpoint
3. Enter data and click "Execute"

#### Option C: PowerShell / Terminal
```powershell
# Create product
Invoke-WebRequest -Uri http://localhost:5000/api/products `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name":"Laptop","price":999.99,"category":"Electronics","stockQuantity":10,"description":"Gaming laptop"}'

# Get all products
Invoke-WebRequest http://localhost:5000/api/products

# Get product by ID
Invoke-WebRequest http://localhost:5000/api/products/1

# Update product
Invoke-WebRequest -Uri http://localhost:5000/api/products/1 `
  -Method PUT `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name":"Updated Laptop","price":899.99,"category":"Electronics","stockQuantity":15,"description":"Better specs"}'

# Delete product
Invoke-WebRequest -Uri http://localhost:5000/api/products/1 -Method DELETE
```

## 📚 Important Flows Explained

### Flow #1: CREATE (POST /api/products)
```
JSON Request (Product data)
    ↓
Model Binding (JSON → C# object)
    ↓
Controller validation
    ↓
Service.CreateProductAsync() [ADD to DbContext]
    ↓
SaveChangesAsync() [Database INSERT]
    ↓
201 Created response + Product with ID
```

### Flow #2: READ ALL (GET /api/products)
```
Controller calls Service.GetAllProductsAsync()
    ↓
DbContext.Products
  .Where(p => p.IsActive == true)     [Filter soft deletes]
  .AsNoTracking()                     [Not tracking - better performance]
  .ToListAsync()                      [Execute async query]
    ↓
Database query: SELECT * FROM Products WHERE IsActive = 1
    ↓
Return 200 OK + Product list
```

### Flow #3: UPDATE (PUT /api/products/{id})
```
Find product by ID
    ↓
Update properties
    ↓
DbContext detects changes (change tracker)
    ↓
SaveChangesAsync() [Database UPDATE]
    ↓
Return 200 OK + Updated product
```

### Flow #4: DELETE (DELETE /api/products/{id})
```
Find product by ID
    ↓
Set IsActive = false (SOFT DELETE - preserve data)
    ↓
SaveChangesAsync() [Database UPDATE]
    ↓
Return 204 No Content
```

### Flow #5: PATCH STOCK (PATCH /api/products/{id}/stock)
```
Receive quantity adjustment (positive = add, negative = remove)
    ↓
Validate (ensure stock won't go negative)
    ↓
Update StockQuantity
    ↓
SaveChangesAsync()
    ↓
Return 200 OK + Updated product
```

## 🗄️ Database Schema

```sql
CREATE TABLE Products (
    Id int PRIMARY KEY IDENTITY(1,1),
    Name nvarchar(100) NOT NULL,
    Description nvarchar(500) NOT NULL,
    Price decimal(10,2) NOT NULL,
    StockQuantity int NOT NULL,
    Category nvarchar(50) NOT NULL,
    CreatedDate datetime2 NOT NULL DEFAULT(GETUTCDATE()),
    UpdatedDate datetime2 NOT NULL DEFAULT(GETUTCDATE()),
    IsActive bit NOT NULL
);

CREATE INDEX IX_Product_Category ON Products(Category);
CREATE INDEX IX_Product_Name ON Products(Name);
```

## 🎯 Testing the API

### Test 1: Create 3 Products
```http
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "name": "Gaming Laptop",
  "description": "High-performance laptop",
  "price": 1299.99,
  "stockQuantity": 15,
  "category": "Electronics"
}
```

### Test 2: Get All Products
```http
GET http://localhost:5000/api/products
```

### Test 3: Get Single Product
```http
GET http://localhost:5000/api/products/1
```

### Test 4: Get by Category
```http
GET http://localhost:5000/api/products/category/Electronics
```

### Test 5: Update Product
```http
PUT http://localhost:5000/api/products/1
Content-Type: application/json

{
  "name": "Updated Gaming Laptop Pro",
  "description": "Even better specs",
  "price": 1399.99,
  "stockQuantity": 20,
  "category": "Electronics"
}
```

### Test 6: Update Stock
```http
PATCH http://localhost:5000/api/products/1/stock
Content-Type: application/json

{
  "quantityAdjustment": 5
}
```

### Test 7: Delete Product
```http
DELETE http://localhost:5000/api/products/1
```

## 📖 Documentation Files

1. **API_DOCUMENTATION.md** - Complete technical reference
   - Detailed flow explanations
   - Database schema
   - All endpoints
   - Advanced concepts

2. **LEARNING_GUIDE.md** - Educational guide
   - Architecture overview
   - Code examples
   - Why design patterns matter
   - Testing options
   - Next learning steps

3. **ProductCatalogAPI.http** - Interactive test requests
   - 8+ pre-built API calls
   - Click to test in VS Code

## 🔗 Integration with Frontend

### React (localhost:3000)
```javascript
// Get all products
const res = await fetch('http://localhost:5000/api/products');
const products = await res.json();

// Create product
await fetch('http://localhost:5000/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'New Product', price: 29.99, ... })
});
```

### Angular (localhost:4200)
```typescript
constructor(private http: HttpClient) {}

getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:5000/api/products');
}

createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>('http://localhost:5000/api/products', product);
}
```

CORS is **already configured** for both React and Angular!

## 💡 Key Learned Concepts

✅ **N-Tier Architecture** - Separation of concerns
✅ **Dependency Injection** - Loose coupling, testability
✅ **Entity Framework Core** - ORM for database operations
✅ **RESTful API Design** - Standard HTTP methods and status codes
✅ **Async/Await** - Non-blocking, scalable operations
✅ **Soft Delete Pattern** - Data preservation and audit trails
✅ **CRUD Operations** - Complete example implementations
✅ **Change Tracking** - How ORM tracks entity modifications
✅ **Interface-Based Services** - Abstraction for flexibility
✅ **Input Validation** - Error handling and HTTP status codes

## 🎓 Next Steps

1. **Add React Frontend** - Create UI to consume this API
2. **Add Angular Frontend** - Alternative React approach
3. **Add ASP.NET MVC** - Form-based alternative to API
4. **Add Validation** - FluentValidation or Data Annotations
5. **Add Authentication** - JWT tokens, user management
6. **Add Unit Tests** - xUnit, Moq, repository patterns
7. **Add Advanced Queries** - Pagination, filtering, search
8. **Add Logging** - Serilog for structured logging
9. **Add Caching** - Redis for performance
10. **Deploy** - Azure, AWS, Docker

## 📝 Important Notes

- **Database:** Uses LocalDB (automatically created on first run)
- **Port:** Default 5000 (configurable in Properties/launchSettings.json)
- **Swagger:** Automatically available at /swagger
- **Logging:** Console output shows SQL queries in Development
- **Soft Delete:** Deleted products marked IsActive=false (data preserved)

## 🚨 Troubleshooting

### Error: "Could not execute because the specified command or file was not found"
- You might need to install EF Core tools: `dotnet tool install --global dotnet-ef --version 8.0.8`

### Database not created?
- Run: `dotnet ef database update`

### Port 5000 already in use?
- Edit `Properties/launchSettings.json` and change port
- Or kill the process: `netstat -ano | findstr :5000`

### Can't connect to React/Angular app?
- Verify CORS policy in Program.cs includes localhost:3000 and :4200
- Check frontend has correct API base URL

## 📞 Questions?

Refer to documentation files:
- **API_DOCUMENTATION.md** - For technical details
- **LEARNING_GUIDE.md** - For explanations and examples
- **ProductCatalogAPI.http** - For test requests
- Code comments throughout - Marked as "IMPORTANT FLOW"

---

## Summary

You now have a **production-ready REST API foundation** that demonstrates:
- Professional architecture patterns
- Clean, maintainable code
- Scalable async operations
- RESTful endpoint design
- Complete CRUD implementation
- Ready for frontend integration

Perfect starting point for learning ASP.NET Core and building with React/Angular! 🎉
