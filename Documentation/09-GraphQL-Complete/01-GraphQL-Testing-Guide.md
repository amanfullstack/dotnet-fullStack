# 🧪 GraphQL Testing Guide - Complete

Complete guide to testing GraphQL queries and mutations in ProductCatalogAPI using multiple test tools and approaches.

---

## 📋 Quick Answer

**Question:** Do we need "Chili Cream" or additional tools?
**Answer:** NO! You have options:

1. **Built-in:** HotChocolate Banana Cake Pop (free, included) ✅ EASIEST
2. **VS Code:** REST Client extension (already used for REST) ✅ FAST
3. **Desktop App:** Altair GraphQL Client (free, open-source) ✅ POWERFUL
4. **Cloud:** Apollo Studio (free tier) ✅ ADVANCED
5. **Code:** Unit tests with xUnit (programmatic) ✅ PROFESSIONAL

---

## 🍰 Method 1: Banana Cake Pop (Built-in Playground)

**Banana Cake Pop** is HotChocolate's official interactive IDE - it comes FREE with HotChocolate!

### Getting Started (30 seconds)

```bash
# 1. Start the app
cd ProductCatalogAPI-WebAPI-EFCore
dotnet run

# 2. Open browser
http://localhost:5000/graphql

# That's it! Banana Cake Pop loads automatically ✅
```

### Features

```
✅ Real-time query editor with syntax highlighting
✅ Built-in documentation (schema explorer)
✅ Auto-complete (IntelliSense)
✅ Query history
✅ Response formatting
✅ Variable support
✅ Execution timing
✅ No installation needed!
```

### Testing Queries in Banana Cake Pop

**Query 1: Get All Products (Basic)**

```graphql
{
  products {
    id
    name
    price
    category
  }
}
```

**Click "Play" button → See response instantly**

```json
{
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Laptop",
        "price": 999.99,
        "category": "Electronics"
      },
      {
        "id": 2,
        "name": "Mouse",
        "price": 29.99,
        "category": "Electronics"
      }
    ]
  }
}
```

---

**Query 2: Get Single Product with Fragment**

```graphql
fragment ProductFields on Product {
  id
  name
  description
  price
  stockQuantity
  category
}

{
  productById(id: 1) {
    ...ProductFields
  }
}
```

---

**Query 3: Using Variables (Most Important!)**

In left panel, add to "Variables" section:

```json
{
  "minPrice": 100,
  "category": "Electronics"
}
```

Query:

```graphql
query GetExpensiveInCategory($minPrice: Float!, $category: String!) {
  productsByCategory(category: $category) {
    id
    name
    price
  }
  expensiveProducts(minPrice: $minPrice) {
    id
    name
    price
  }
}
```

---

**Mutation 1: Create Product**

```graphql
mutation CreateNewProduct($input: CreateProductInput!) {
  createProduct(input: $input) {
    id
    name
    price
    stockQuantity
    category
  }
}
```

Variables:

```json
{
  "input": {
    "name": "Wireless Keyboard",
    "description": "Mechanical wireless keyboard",
    "price": 149.99,
    "stockQuantity": 25,
    "category": "Electronics"
  }
}
```

---

**Mutation 2: Update Stock**

```graphql
mutation AdjustStock($id: Int!, $quantity: Int!) {
  updateStock(id: $id, quantity: $quantity) {
    id
    name
    stockQuantity
  }
}
```

Variables:

```json
{
  "id": 1,
  "quantity": 50
}
```

---

### 🎯 Why Use Banana Cake Pop?

- ✅ NO extra installation
- ✅ Free with HotChocolate
- ✅ Professional IDE
- ✅ Perfect for development
- ✅ No authentication needed for localhost
- ✅ Awesome for interviews (shows you know HotChocolate!)

---

## 📨 Method 2: REST Client Extension (VS Code)

**Advantage:** Use same `.http` file for REST + GraphQL testing

### Setup (1 minute)

1. Install: `REST Client` extension in VS Code
2. Create file: `ProductCatalogAPI-GraphQL.http`

### Example: ProductCatalogAPI-GraphQL.http

```http
### GraphQL Server
@baseUrl = http://localhost:5000
@contentType = application/json

### Query: Get All Products
POST {{baseUrl}}/graphql
Content-Type: {{contentType}}

{
  "query": "{ products { id name price category } }"
}

### Response: Should show all products ✓

---

### Query: Get Product by ID
POST {{baseUrl}}/graphql
Content-Type: {{contentType}}

{
  "query": "{ productById(id: 1) { id name price description } }"
}

### Response: Single product with details ✓

---

### Query: Get by Category with Variables
POST {{baseUrl}}/graphql
Content-Type: {{contentType}}

{
  "query": "query GetByCategory($cat: String!) { productsByCategory(category: $cat) { id name price } }",
  "variables": {
    "cat": "Electronics"
  }
}

### Response: ProductsByCategory ✓

---

### Mutation: Create Product
POST {{baseUrl}}/graphql
Content-Type: {{contentType}}

{
  "query": "mutation { createProduct(input: { name: \"Monitor\", description: \"4K Display\", price: 299.99, stockQuantity: 15, category: \"Electronics\" }) { id name price } }"
}

### Response: New product created ✓

---

### Mutation: Update Stock
POST {{baseUrl}}/graphql
Content-Type: {{contentType}}

{
  "query": "mutation { updateStock(id: 1, quantity: 100) { id name stockQuantity } }"
}

### Response: Stock updated ✓

---

### Mutation: Delete Product
POST {{baseUrl}}/graphql
Content-Type: {{contentType}}

{
  "query": "mutation { deleteProduct(id: 2) { success message } }"
}

### Response: Product deleted ✓
```

### How to Use

1. Open `ProductCatalogAPI-GraphQL.http` in VS Code
2. Click "Send Request" above each query
3. Response appears in right panel
4. Perfect for automation + documentation!

---

## 🎨 Method 3: Altair GraphQL Client (Desktop)

**Advantage:** Standalone app, works offline, better UI than browser

### Install (2 minutes)

```bash
# Option 1: Download from website
https://altairgraphql.dev

# Option 2: Windows package manager
choco install altair

# Option 3: NPM
npm install -g altair-graphql-cli
```

### Usage

1. Launch Altair app
2. Enter URL: `http://localhost:5000/graphql`
3. Query panel on left, response on right
4. All same queries as Banana Cake Pop
5. Better offline support + UI themes

### Why Use Altair?

- ✅ Standalone app (doesn't depend on browser)
- ✅ Offline capabilities
- ✅ Better UI than playground
- ✅ Query collections
- ✅ Request history
- ✅ Perfect for multiple projects

---

## 🧪 Method 4: Unit Tests (xUnit)

**Advantage:** Automated testing, CI/CD integration, interview-ready

### Create Test File

Create: `ProductCatalogAPI.Tests/GraphQLTests.cs`

```csharp
using Xunit;
using HotChocolate.Execution;
using ProductCatalogAPI.GraphQL;
using ProductCatalogAPI.Services;
using ProductCatalogAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace ProductCatalogAPI.Tests
{
    public class GraphQLTests
    {
        private readonly ProductDbContext _context;
        private readonly IProductService _productService;

        public GraphQLTests()
        {
            // Setup in-memory database for testing
            var options = new DbContextOptionsBuilder<ProductDbContext>()
                .UseInMemoryDatabase("TestDb")
                .Options;

            _context = new ProductDbContext(options);
            _productService = new ProductService(_context, null); // null = no cache for tests
        }

        [Fact]
        public async Task Query_GetAllProducts_ReturnsAllProducts()
        {
            // Arrange
            var query = "{ products { id name price } }";

            // Act
            var product1 = new Models.Product
            {
                Name = "Laptop",
                Price = 999.99m,
                Category = "Electronics"
            };
            await _productService.CreateProductAsync(product1);

            var products = await _productService.GetAllProductsAsync();

            // Assert
            Assert.NotEmpty(products);
            Assert.True(products.Any(p => p.Name == "Laptop"));
        }

        [Fact]
        public async Task Query_GetProductById_ReturnsCorrectProduct()
        {
            // Arrange
            var product = new Models.Product
            {
                Name = "Mouse",
                Price = 29.99m,
                Category = "Peripherals"
            };
            var created = await _productService.CreateProductAsync(product);

            // Act
            var retrieved = await _productService.GetProductByIdAsync(created.Id);

            // Assert
            Assert.NotNull(retrieved);
            Assert.Equal("Mouse", retrieved.Name);
        }

        [Fact]
        public async Task Mutation_CreateProduct_CreatesNewProduct()
        {
            // Arrange
            var newProduct = new Models.Product
            {
                Name = "Keyboard",
                Price = 149.99m,
                StockQuantity = 25,
                Category = "Electronics"
            };

            // Act
            var created = await _productService.CreateProductAsync(newProduct);

            // Assert
            Assert.NotNull(created);
            Assert.True(created.Id > 0);
            Assert.Equal("Keyboard", created.Name);
        }

        [Fact]
        public async Task Mutation_UpdateStock_UpdatesCorrectly()
        {
            // Arrange
            var product = new Models.Product
            {
                Name = "Monitor",
                Price = 299.99m,
                StockQuantity = 10,
                Category = "Electronics"
            };
            var created = await _productService.CreateProductAsync(product);

            // Act
            var updated = await _productService.UpdateStockAsync(created.Id, 50);

            // Assert
            Assert.True(updated);
            var result = await _productService.GetProductByIdAsync(created.Id);
            Assert.Equal(60, result.StockQuantity); // 10 + 50
        }

        [Fact]
        public async Task Mutation_DeleteProduct_DeletesCorrectly()
        {
            // Arrange
            var product = new Models.Product
            {
                Name = "Headphones",
                Price = 199.99m,
                Category = "Audio"
            };
            var created = await _productService.CreateProductAsync(product);

            // Act
            var deleted = await _productService.DeleteProductAsync(created.Id);

            // Assert
            Assert.True(deleted);
            var result = await _productService.GetProductByIdAsync(created.Id);
            Assert.Null(result); // Soft delete, IsActive = false
        }
    }
}
```

### Run Tests

```bash
cd ProductCatalogAPI-WebAPI-EFCore
dotnet test

# Or from test project
cd ProductCatalogAPI.Tests
dotnet test --verbosity normal
```

---

## 🚀 Method 5: curl from Terminal

**Advantage:** Scriptable, CI/CD friendly, no UI needed

```bash
# Query: Get All Products
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ products { id name price category } }"}'

# Query: Get Product by ID
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ productById(id: 1) { id name price } }"}'

# Query with Variables
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetExpensive($minPrice: Float!) { expensiveProducts(minPrice: $minPrice) { id name price } }",
    "variables": { "minPrice": 100 }
  }'

# Mutation: Create Product
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createProduct(input: { name: \"Tablet\", price: 499.99, stockQuantity: 20, category: \"Electronics\" }) { id name price } }"
  }'

# Mutation: Update Stock
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updateStock(id: 1, quantity: 100) { id stockQuantity } }"
  }'

# Mutation: Delete Product
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { deleteProduct(id: 2) { success message } }"
  }'
```

---

## 📊 Comparison: Which Method to Use?

| Method | Best For | Difficulty | Setup Time | Features |
|--------|----------|------------|-----------|----------|
| **Banana Cake Pop** | Development | Easy | 30 sec | IDE, docs, playground |
| **REST Client** | Quick tests | Easy | 1 min | Automation, templates |
| **Altair** | Complex queries | Easy | 2 min | Offline, collections |
| **Unit Tests** | CI/CD, coverage | Hard | 15 min | Automated, repeatable |
| **curl** | Scripts, APIs | Hard | 5 min | Terminal friendly |

---

### 🎯 Recommendation for You

**Start with:** Banana Cake Pop (0 setup!)
**Then add:** REST Client (.http file) for documentation
**For interviews:** Show unit tests + Banana Cake Pop playground
**For production:** Use curl in CI/CD pipelines

---

## 🔍 Debugging GraphQL

### Common Issues

**Issue 1: "Field not found" error**
```graphql
# ❌ WRONG: Field doesn't exist
{ products { name price invalidField } }

# ✅ CORRECT: Check schema first
{ products { name price stockQuantity } }
```

**How to check schema:**
- Banana Cake Pop: Click "Schema" tab on right
- Altair: Click "Docs" panel on left side

---

**Issue 2: Type mismatch in variables**
```graphql
# ❌ WRONG: minPrice is Decimal, but sending String
query GetExpensive($minPrice: String!) { ... }

# ✅ CORRECT: Match the type
query GetExpensive($minPrice: Float!) { ... }
```

---

**Issue 3: Null values in response**
```graphql
# Issue: Description is null even though we set it
{
  productById(id: 1) {
    id
    name
    description  # Returns null!
  }
}

# Solution: Check database - description might actually be NULL
# Or check ORM mapping - ensure Description property maps correctly
```

---

## 📚 Quick Reference

### GraphQL Request Format

```json
{
  "query": "{ products { id name } }",
  "variables": { "id": 1 },
  "operationName": "GetProducts"  // Optional
}
```

### GraphQL Response Format

```json
{
  "data": { "products": [...] },
  "errors": [{ "message": "Error details" }]  // If error occurs
}
```

### HTTP Status Codes

- **200 OK** - Even if GraphQL has errors (check response.data)
- **400 Bad Request** - Invalid JSON or syntax
- **500 Server Error** - Unhandled exception

---

## ✅ Testing Checklist

Before you finish testing, verify:

- [ ] Banana Cake Pop loads at http://localhost:5000/graphql
- [ ] Can run "Get All Products" query
- [ ] Can run "Get By ID" query
- [ ] Can create product via mutation
- [ ] Can update stock via mutation
- [ ] Can delete product via mutation
- [ ] Variables work correctly
- [ ] Fragments are working
- [ ] Error responses show proper messages
- [ ] Schema documentation is visible

---

## 🎓 What You Learned

✅ Multiple ways to test GraphQL
✅ Banana Cake Pop playground
✅ REST Client automation
✅ Unit testing GraphQL
✅ curl scripting
✅ Debugging techniques

**Ready to dig into GraphQL concepts?** → See `02-GraphQL-Concepts.md`

---

**Next:** Complete GraphQL + HotChocolate concepts guide! 🚀
