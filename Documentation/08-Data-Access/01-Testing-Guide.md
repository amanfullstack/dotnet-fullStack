# 🧪 Testing All 3 Data Access Approaches

Complete guide showing how to test EF Core, ADO.NET, and GraphQL endpoints with examples.

---

## 🚀 Running the Application

```bash
cd d:\dotnet-fullStack\ProductCatalogAPI-WebAPI-EFCore
dotnet run

# Application starts on http://localhost:5000
```

---

## 1️⃣ Entity Framework Core (REST API)

### Base URL
```
http://localhost:5000/api/products
```

### Endpoints

#### GET All Products
```bash
curl http://localhost:5000/api/products

# Response (200 OK):
[
  {"id":1,"name":"Laptop","price":999.99,"stockQuantity":10,"category":"Electronics"},
  {"id":2,"name":"Mouse","price":29.99,"stockQuantity":50,"category":"Electronics"}
]
```

#### GET Single Product
```bash
curl http://localhost:5000/api/products/1

# Response (200 OK):
{"id":1,"name":"Laptop","price":999.99,"stockQuantity":10,"category":"Electronics"}
```

#### GET by Category
```bash
curl http://localhost:5000/api/products/category/Electronics

# Response (200 OK):
[
  {"id":1,"name":"Laptop","price":999.99,...},
  {"id":2,"name":"Mouse","price":29.99,...}
]
```

#### POST - Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Keyboard",
    "description": "Mechanical keyboard",
    "price": 149.99,
    "stockQuantity": 25,
    "category": "Electronics"
  }'

# Response (201 Created):
{"id":3,"name":"Keyboard","price":149.99,...}
```

#### PUT - Update Product
```bash
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High-performance gaming",
    "price": 1299.99,
    "stockQuantity": 8,
    "category": "Electronics"
  }'

# Response (200 OK):
{"id":1,"name":"Gaming Laptop","price":1299.99,...}
```

#### PATCH - Update Stock
```bash
curl -X PATCH http://localhost:5000/api/products/1/stock \
  -H "Content-Type: application/json" \
  -d '{"quantityAdjustment": 5}'

# Response (200 OK):
{"id":1,"name":"Laptop","stockQuantity":15,...}
```

#### DELETE - Delete Product
```bash
curl -X DELETE http://localhost:5000/api/products/1

# Response (204 No Content - empty body)
```

### Performance Note
```
✅ Speed: ~150ms per request (with ORM overhead)
✅ Developer Experience: Excellent (LINQ + Auto-mapping)
❌ Verbosity: Moderate code complexity
```

---

## 2️⃣ ADO.NET (REST API)

### Base URL
```
http://localhost:5000/api/ado/products
```

### Endpoints

**Same operations as EF Core, but using raw SQL:**

```bash
# GET All
curl http://localhost:5000/api/ado/products

# POST Create
curl -X POST http://localhost:5000/api/ado/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Monitor","price":299.99,"stockQuantity":15,"category":"Electronics"}'

# PUT Update
curl -X PUT http://localhost:5000/api/ado/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated","price":999.99,"stockQuantity":10,"category":"Electronics"}'

# DELETE
curl -X DELETE http://localhost:5000/api/ado/products/1
```

### Key Differences from EF Core

```
EF Core:
  WHERE IsActive = 1

ADO.NET (Equivalent):
  WHERE IsActive = @IsActive_true

Benefits:
✅ Speed: ~50ms (no ORM overhead)
✅ Control: Full SQL customization
❌ Verbosity: Manual mapping is tedious

Example SQL (in ProductAdoService):
  SELECT Id, Name, Description, Price, StockQuantity, Category
  FROM Products
  WHERE IsActive = 1
  ORDER BY Name
```

### Performance Note
```
✅ Speed: ~50ms per request (direct SQL - FASTEST!)
❌ Developer Experience: Manual object mapping
❌ Verbosity: Lots of boilerplate code
```

---

## 3️⃣ GraphQL + HotChocolate (Query Language)

### Base URL
```
http://localhost:5000/graphql
```

### Interactive Playground
```
Open in browser: http://localhost:5000/graphql

Features:
✅ Real-time query editor
✅ Built-in documentation
✅ Schema explorer
✅ Query history
```

### GraphQL Queries

#### Query: Get All Products
```graphql
query {
  products {
    id
    name
    price
    category
  }
}
```

**Request:**
```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ products { id name price category } }"
  }'
```

**Response:**
```json
{
  "data": {
    "products": [
      {"id":1,"name":"Laptop","price":999.99,"category":"Electronics"},
      {"id":2,"name":"Mouse","price":29.99,"category":"Electronics"}
    ]
  }
}
```

#### Query: Get Product by ID (only specific fields)
```graphql
query {
  productById(id: 1) {
    name
    price
  }
}
```

**Response (only name & price, NOT description or other fields):**
```json
{
  "data": {
    "productById": {
      "name": "Laptop",
      "price": 999.99
    }
  }
}
```

#### Query: Get Products by Category
```graphql
query {
  productsByCategory(category: "Electronics") {
    id
    name
    price
    stockQuantity
  }
}
```

#### Query: Get Expensive Products
```graphql
query {
  expensiveProducts(minPrice: 100) {
    id
    name
    price
  }
}
```

#### Query: Get Low Stock Products
```graphql
query {
  lowStockProducts(threshold: 10) {
    id
    name
    stockQuantity
  }
}
```

#### Mutation: Create Product
```graphql
mutation {
  createProduct(input: {
    name: "Headphones"
    description: "Wireless headphones"
    price: 199.99
    stockQuantity: 20
    category: "Electronics"
  }) {
    id
    name
    price
    category
  }
}
```

**Request:**
```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createProduct(input: { name: \"Headphones\", description: \"Wireless\", price: 199.99, stockQuantity: 20, category: \"Electronics\" }) { id name price } }"
  }'
```

#### Mutation: Update Product
```graphql
mutation {
  updateProduct(id: 1, input: {
    name: "Premium Laptop"
    price: 1499.99
    stockQuantity: 5
    category: "Electronics"
  }) {
    id
    name
    price
  }
}
```

#### Mutation: Delete Product
```graphql
mutation {
  deleteProduct(id: 1) {
    success
    message
  }
}
```

#### Mutation: Update Stock
```graphql
mutation {
  updateStock(id: 1, quantity: 10) {
    id
    name
    stockQuantity
  }
}
```

### Key Benefits of GraphQL

```
✅ No Over-fetching:
  REST:     GET /api/products/1 → Returns ALL fields
  GraphQL:  { productById(id:1) { name price } } → Only name & price

✅ No Under-fetching:
  REST:     GET /products/1 + GET /categories/1 (2 requests!)
  GraphQL:  { product { id category { name } } } (1 request!)

✅ Playground:
  REST:     Need Postman or curl
  GraphQL:  Interactive UI with docs at /graphql

✅ Self-documenting:
  Schema tells client exactly what's available
  No API docs needed!
```

### Performance Note
```
✅ Speed: ~80ms (parsing query + execution)
✅ Developer Experience: Excellent (query exactly what you need!)
✅ Bandwidth: Minimal (no unnecessary fields)
```

---

## 📊 Quick Comparison: Making the Same Request

### Get single product name and price

**EF Core REST:**
```bash
curl http://localhost:5000/api/products/1

# Response (includes ALL fields):
{"id":1,"name":"Laptop","price":999.99,"description":"...","stockQuantity":10,"category":"Electronics","createdDate":"...","updatedDate":"...","isActive":true}

# Bandwidth: ~300 bytes
# Over-fetching: Received 10 fields, needed 2!
```

**ADO.NET REST:**
```bash
curl http://localhost:5000/api/ado/products/1

# Response (same issue):
{"id":1,"name":"Laptop","price":999.99,"description":"...","stockQuantity":10,...}

# Bandwidth: ~300 bytes
# Over-fetching: Same problem!
```

**GraphQL:**
```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ productById(id: 1) { name price } }"}'

# Response (ONLY requested fields):
{"data":{"productById":{"name":"Laptop","price":999.99}}}

# Bandwidth: ~50 bytes (6x smaller!)
# No over-fetching: Perfect!
```

---

## 🎯 Choosing Which to Use

### Use **EF Core** when:
```
✅ Building standard CRUD REST API
✅ Team knows C# and LINQ
✅ Performance is acceptable
✅ Rapid development needed
✅ You want ORM benefits
```

### Use **ADO.NET** when:
```
✅ Maximum performance required
✅ Complex reporting queries
✅ Using stored procedures
✅ Raw SQL is simpler than LINQ
✅ Performance profiling showed SQL layer is bottleneck
```

### Use **GraphQL** when:
```
✅ Building modern API (React, Vue, Angular frontend)
✅ Multiple client types (mobile + web)
✅ Clients have different data needs
✅ Over/under-fetching is problematic
✅ Want real-time with subscriptions
✅ Bandwidth is concern (mobile)
```

---

## 📊 Console Output

When you run requests, you'll see console output showing which approach was used:

```
[ADO.NET REST] GET /api/ado/products
[ADO.NET] Executing: Get All Products
[ADO.NET] Retrieved 5 products

[GraphQL] Query: GetProducts
[GraphQL] Query: GetProductById(1)

EF Core uses normal logging (if configured)
```

---

## 🔄 All 3 Access Same Database

```
┌─────────────────────────────────────┐
│      Same Database                  │
│   ProductCatalogDB.Products         │
└─────────────────────────────────────┘
  ▲         ▲              ▲
  │         │              │
  │         │              │
  │         │              │
┌─┴──┐   ┌──┴─┐         ┌──┴─────┐
│EF │   │ADO │         │GraphQL │
│Cor│   │.NE │         │        │
│   │   │    │         │        │
└───┘   └────┘         └────────┘
 REST    REST          Query Lang
```

---

## 💡 Pro Tips

1. **Test with cache headers:**
   ```bash
   curl -i http://localhost:5000/api/products
   # Check: Cache-Control, ETag, Last-Modified headers
   ```

2. **GraphQL Introspection Query:**
   ```graphql
   {
     __schema {
       types { name }
     }
   }
   ```

3. **Compare Performance:**
   ```bash
   # Time all 3 requests
   time curl http://localhost:5000/api/products
   time curl http://localhost:5000/api/ado/products
   time curl -X POST http://localhost:5000/graphql -H "Content-Type: application/json" -d '{"query":"{ products { id name price } }"}'
   ```

4. **GraphQL Query Variables (for complex queries):**
   ```graphql
   query GetExpensive($minPrice: Float!) {
     expensiveProducts(minPrice: $minPrice) {
       id
       name
       price
     }
   }

   variables: { "minPrice": 100 }
   ```

---

## 🎓 Learning Outcomes

After testing all 3, you'll understand:

✅ How EF Core abstracts database operations
✅ How ADO.NET gives direct database control
✅ How GraphQL allows flexible queries
✅ Trade-offs between each approach
✅ When to use each in real projects
✅ How to combine them effectively

---

**Ready to test? Start the app and try the curl commands above!** 🚀
