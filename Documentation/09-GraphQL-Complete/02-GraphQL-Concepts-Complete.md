# 📚 GraphQL + HotChocolate Complete Concepts Guide

**Purpose:** Master GraphQL concepts with HotChocolate using real examples from ProductCatalogAPI.

---

## 🎯 Table of Contents

1. What is GraphQL?
2. Why Do We Need GraphQL?
3. Core Concepts
4. Schema Deep Dive
5. Resolvers Explained
6. Apollo Federation
7. Advanced Patterns
8. Interview Prep
9. ProductCatalogAPI Examples

---

## 1️⃣ What is GraphQL?

### Simple Definition

**GraphQL = Query Language for APIs**

- `REST` = Fixed endpoints that return ALL fields
- `GraphQL` = Flexible queries where clients request EXACT fields needed

### Analogy: Restaurant Menu

| Approach | Ordering System |
|----------|-----------------|
| **REST** | Menu says "Entire Chicken Combo ($20 total: chicken + rice + sauce + vegetables)" → You eat everything |
| **GraphQL** | Custom menu "Pick chicken ($8) + sauce ($1.50) + no rice + no vegetables ($0) = $9.50" → Pay only for what you want |

### Real Example from ProductCatalogAPI

**REST API:**
```bash
GET /api/products/1

# Response: Gets ALL fields
{
  "id": 1,
  "name": "Laptop",
  "description": "High-performance gaming laptop",
  "price": 999.99,
  "category": "Electronics",
  "stockQuantity": 10,
  "isActive": true,
  "createdDate": "2024-01-15T10:30:00Z",
  "updatedDate": "2024-01-20T14:45:00Z"
}
# You got 8 fields, but only needed 2!
```

**GraphQL:**
```graphql
query {
  productById(id: 1) {
    name
    price
  }
}

# Response: Gets ONLY requested fields
{
  "data": {
    "productById": {
      "name": "Laptop",
      "price": 999.99
    }
  }
}
# Perfect! Only 2 fields, smaller response
```

---

## 2️⃣ Why Do We Need GraphQL?

### Problem 1: Over-fetching (REST Problem)

Mobile app needs just product name and price:
- REST: Returns ALL fields (wastes bandwidth)
- GraphQL: Returns ONLY name + price (saves bandwidth!)

### Problem 2: Under-fetching (REST Problem)

Get product details + category details:
- REST: 2 API calls required:
  ```
  GET /api/products/1          → Get product
  GET /api/categories/5        → Get category separately
  ```
- GraphQL: 1 query (nested relationships):
  ```graphql
  {
    productById(id: 1) {
      name
      category {
        name
        description
      }
    }
  }
  ```

### Problem 3: Type Safety (REST Problem)

- REST: Clients don't know what fields exist (need to read docs or try)
- GraphQL: Schema is self-documenting and queryable

### Problem 4: Versioning (REST Problem)

- REST: Need `/v1/products`, `/v2/products` APIs to avoid breaking changes
- GraphQL: Single endpoint, deprecate old fields without breaking

### When to Use GraphQL

✅ Multiple client types (web, mobile, desktop)
✅ Varying data requirements
✅ Mobile apps (bandwidth critical)
✅ Complex relationships
✅ Rapid frontend iteration

❌ Simple CRUD (REST is faster)
❌ File uploads (complex in GraphQL)
❌ Real-time streaming (use subscriptions instead)

---

## 3️⃣ Core Concepts

### A. Queries (Read Operations)

**Definition:** GraphQL queries fetch data (like GET in REST)

```graphql
# Simple query - get all products
query {
  products {
    id
    name
    price
  }
}

# Query with arguments - get specific product
query {
  productById(id: 1) {
    id
    name
    description
    price
  }
}

# Query with multiple root fields
query {
  products { id name }
  expensiveProducts(minPrice: 500) { id name price }
}

# Named query (best practice for production)
query GetAllProducts {
  products {
    id
    name
    price
    category
  }
}
```

**In ProductCatalogAPI:**
```csharp
// ProductQuery.cs - Defines available queries
public class ProductQuery
{
    public async Task<List<Product>> GetProducts([Service] IProductService service)
    {
        return await service.GetAllProductsAsync();
    }

    public async Task<Product?> GetProductById(int id, [Service] IProductService service)
    {
        return await service.GetProductByIdAsync(id);
    }
}
```

---

### B. Mutations (Write Operations)

**Definition:** GraphQL mutations modify data (like POST/PUT/DELETE in REST)

```graphql
# Create product mutation
mutation {
  createProduct(input: {
    name: "Keyboard"
    price: 149.99
    stockQuantity: 25
    category: "Electronics"
  }) {
    id
    name
    price
  }
}

# Update product mutation
mutation {
  updateProduct(id: 1, input: {
    name: "Gaming Keyboard"
    price: 199.99
  }) {
    id
    name
    price
  }
}

# Delete product mutation
mutation {
  deleteProduct(id: 1) {
    success
    message
  }
}
```

**In ProductCatalogAPI:**
```csharp
// ProductQuery.cs - ProductMutation class
public class ProductMutation
{
    public async Task<Product> CreateProduct(
        CreateProductInput input,
        [Service] IProductService service)
    {
        var product = new Product { Name = input.Name, Price = input.Price, ... };
        return await service.CreateProductAsync(product);
    }
}
```

---

### C. Subscriptions (Real-time)

**Definition:** Real-time updates when data changes (WebSocket)

```graphql
subscription {
  productCreated {
    id
    name
    price
  }
}

# When someone creates product → Client receives update automatically
```

*Note: Not implemented in ProductCatalogAPI, but important for interviews!*

---

### D. Scalars (Data Types)

**Definition:** Primitive types that hold actual values

```graphql
# GraphQL Built-in Scalars
String    # "Laptop", "Mouse"
Int       # 1, 2, 100
Float     # 999.99, 29.99  (Decimals!)
Boolean   # true, false
ID        # "1", "product-123" (unique identifier)

# Custom Scalars (defined by API)
DateTime  # 2024-01-15T10:30:00Z
Decimal   # 999.99 (for prices!)
```

**In ProductCatalogAPI:**
```csharp
public class Product
{
    public int Id { get; set; }              // Int scalar
    public string Name { get; set; }         // String scalar
    public decimal Price { get; set; }       // Float/Decimal scalar
    public bool IsActive { get; set; }       // Boolean scalar
    public DateTime CreatedDate { get; set; } // DateTime scalar
}
```

---

### E. Types & Object Types

**Definition:** Composite data structures combining multiple scalars

```graphql
# Object Type definition
type Product {
  id: Int!              # Non-nullable (always present)
  name: String!         # Non-nullable
  description: String   # Nullable (can be null)
  price: Float!         # Non-nullable decimal
  stockQuantity: Int!
  category: String!
  isActive: Boolean!
  createdDate: DateTime!
}

# Nullable vs Non-nullable
price: Float!        # ✓ Always has value, error if null
description: String  # ✓ Can be null (no ! means optional)
```

**In ProductCatalogAPI:**
```csharp
public class Product
{
    public int Id { get; set; } = 0;           // Int!
    public string Name { get; set; } = "";     // String!
    public string? Description { get; set; }   // String (nullable)
    public decimal Price { get; set; }         // Float!
    public int StockQuantity { get; set; }     // Int!
    public string Category { get; set; } = ""; // String!
    public bool IsActive { get; set; } = true; // Boolean!
}
```

---

### F. Arguments

**Definition:** Parameters passed to queries/mutations

```graphql
# Query with arguments
query {
  productById(id: 1) { name }        # id = argument
  productsByCategory(category: "Electronics") { name }  # category = argument
  expensiveProducts(minPrice: 500) { name }  # minPrice = argument
}

# Mutation with arguments
mutation {
  createProduct(input: {...}) { id }  # input = argument
  updateStock(id: 1, quantity: 50) { name }  # id, quantity = arguments
}
```

**In ProductCatalogAPI:**
```csharp
public async Task<Product?> GetProductById(
    int id,  // ← Argument
    [Service] IProductService service)
{
    return await service.GetProductByIdAsync(id);
}

public async Task<Product?> UpdateStock(
    int id,           // ← Argument
    int quantity,     // ← Argument
    [Service] IProductService service)
{
    var success = await service.UpdateStockAsync(id, quantity);
    return await service.GetProductByIdAsync(id);
}
```

---

## 4️⃣ Schema Deep Dive

### What is a Schema?

**Schema = Contract between API and Client**
- Defines all queries available
- Defines all mutations available
- Defines all types and fields
- Self-documenting!

### Schema of ProductCatalogAPI

```graphql
# Root Query Type - all possible queries
type Query {
  products: [Product!]!                          # Get all products
  productById(id: Int!): Product                 # Get by ID
  productsByCategory(category: String!): [Product!]!  # Get by category
  expensiveProducts(minPrice: Float!): [Product!]!    # Get expensive
  lowStockProducts(threshold: Int!): [Product!]!      # Get low stock
}

# Root Mutation Type - all possible mutations
type Mutation {
  createProduct(input: CreateProductInput!): Product!
  updateProduct(id: Int!, input: UpdateProductInput!): Product
  deleteProduct(id: Int!): DeleteProductResponse!
  updateStock(id: Int!, quantity: Int!): Product
}

# Product Type
type Product {
  id: Int!
  name: String!
  description: String
  price: Float!
  stockQuantity: Int!
  category: String!
  isActive: Boolean!
  createdDate: DateTime!
  updatedDate: DateTime!
}

# Input Types (for mutations)
input CreateProductInput {
  name: String!
  description: String
  price: Float!
  stockQuantity: Int!
  category: String!
}

input UpdateProductInput {
  name: String!
  description: String
  price: Float!
  stockQuantity: Int!
  category: String!
}

# Response Types
type DeleteProductResponse {
  success: Boolean!
  message: String!
}
```

### Querying the Schema (Introspection)

**Clients can ask "what queries exist?"**

```graphql
# Introspection Query - Get all type names
{
  __schema {
    types {
      name
      kind
    }
  }
}

# Introspection Query - Get all Query roots
{
  __schema {
    queryType {
      fields {
        name
        args { name type }
      }
    }
  }
}

# Introspection Query - Get Product type details
{
  __type(name: "Product") {
    name
    fields {
      name
      type { name ofType { name } }
    }
  }
}
```

**Why is this important?**
- Documentation generation (100% always up-to-date!)
- IDE auto-complete
- Client code generation
- Schema validation

---

## 5️⃣ Resolvers Explained

### What is a Resolver?

**Resolver = Function that fetches/computes the value for a field**

When you query `{ productById(id: 1) { name price } }`:
1. Resolver for `productById` is called (with id=1)
2. Gets product from database
3. Resolver for `name` field is called
4. Resolver for `price` field is called
5. Returns `{ name: "Laptop", price: 999.99 }`

### Resolver Architecture

```
Client Query: { productById(id: 1) { name price } }
        ↓
HotChocolate Runtime
        ↓
ProductQuery.GetProductById(id: 1)  ← Resolver 1: Gets Product from DB
        ↓
Resolves "name" field from Product  ← Resolver 2: Returns product.Name
Resolves "price" field from Product ← Resolver 3: Returns product.Price
        ↓
Returns: { name: "Laptop", price: 999.99 }
        ↓
Client receives response
```

### Resolver in ProductCatalogAPI

```csharp
// File: ProductQuery.cs
public class ProductQuery
{
    // ← This entire method is a RESOLVER
    public async Task<Product?> GetProductById(
        int id,  // Retrieved from GraphQL query argument
        [Service] IProductService service)  // Dependency injected
    {
        Console.WriteLine($"[GraphQL] Resolver: GetProductById({id})");

        // Resolver execution:
        // 1. Gets called when client queries productById(id: 1)
        // 2. Fetches product from database
        // 3. Returns Product object
        return await service.GetProductByIdAsync(id);
    }
}

// What happens when client queries:
// { productById(id: 1) { name price description } }
//
// Step 1: ProductQuery.GetProductById resolver executes
//         → Returns Product object from database
//
// Step 2: Field resolvers execute for each requested field:
//         - name resolver: returns product.Name
//         - price resolver: returns product.Price
//         - description resolver: returns product.Description
//
// Step 3: Final response assembled and sent to client
```

### Types of Resolvers

**1. Root Resolvers (Query/Mutation)**
```csharp
public async Task<Product?> GetProductById(int id, [Service] IProductService service)
{
    // This is a ROOT resolver for productById field
    // It's the entry point for this query
    return await service.GetProductByIdAsync(id);
}
```

**2. Field Resolvers (Automatic)**
```csharp
// For Product type, these are AUTO-resolved:
public class Product
{
    public int Id { get; set; }              // Field resolver: returns this.Id
    public string Name { get; set; }         // Field resolver: returns this.Name
    public decimal Price { get; set; }       // Field resolver: returns this.Price
}

// HotChocolate automatically creates resolvers for all properties!
```

**3. Custom Field Resolvers (Advanced)**
```csharp
// If you need custom logic for a field
public class ProductType : ObjectType<Product>
{
    protected override void Configure(IObjectTypeDescriptor<Product> descriptor)
    {
        // Custom resolver for Price field (add 10% tax)
        descriptor
            .Field(p => p.Price)
            .Resolve((ctx, product) => product.Price * 1.10m)
            .Name("priceWithTax");
    }
}

// Now when client queries "priceWithTax", custom resolver executes
```

### Resolver Execution Order

```graphql
mutation {
  createProduct(input: { name: "Keyboard", price: 149.99 }) {
    id
    name
    price
  }
}
```

Execution flow:
```
1. ProductMutation.CreateProduct resolver executes
   ↓ Saves product to database
   ↓ Returns created Product object

2. For returned product, resolve requested fields:
   - id field resolver: returns createdProduct.Id
   - name field resolver: returns createdProduct.Name
   - price field resolver: returns createdProduct.Price

3. Build response and send to client
```

### Performance Tip: N+1 Query Problem

**Bad Example:**
```csharp
public async Task<List<Product>> GetProducts([Service] IProductService service)
{
    var products = await service.GetAllProductsAsync(); // 1 query
    // OH NO! If user asks for category details:
    // for each product, GetCategory would hit DB again
    // = 1 + N queries! (N = number of products)
}

// If 100 products → 1 + 100 = 101 database queries!
```

**Good Example:**
```csharp
public async Task<List<Product>> GetProducts(
    [Service] IProductService service)
{
    var products = await service.GetAllProductsAsync(); // 1 query with all data
    return products;
}
// Still only 1 database query, even if user asks for category!
```

---

## 6️⃣ Apollo Federation

### What is Apollo Federation?

**Problem:** Multiple GraphQL APIs, but need to combine them

**Example Scenario:**
- ProductAPI (Laptop, Mouse)
- UserAPI (John, Jane)
- OrderAPI (Order #1, Order #2)

Client wants: "Show me products ordered by user John" → Need data from all 3!

### Apollo Federation Solution

**Federated Schema:**
```graphql
# Product Service Schema
type Product @key(fields: "id") {
  id: Int!
  name: String!
  price: Float!
}

# User Service Schema
type User @key(fields: "id") {
  id: Int!
  name: String!
  email: String!
}

# Order Service Schema
type Order @key(fields: "id") {
  id: Int!
  userId: Int!
  user: User   # References User from User Service
  productId: Int!
  product: Product  # References Product from Product Service
  quantity: Int!
}

# Apollo Gateway combines all 3 into 1 schema!
```

### Apollo Federation with HotChocolate

**Setup (HotChocolate 14+):**

```bash
# Install Apollo Federation support
dotnet add package HotChocolate.Fusion
```

**Implementing Entities (Federation):**

```csharp
// Product Service
[GraphQLType]
public class Product
{
    [GraphQLType(IsKey = true)]  // ← This field is unique
    public int Id { get; set; }

    public string Name { get; set; }
    public decimal Price { get; set; }
}

// User Service
[GraphQLType]
public class User
{
    [GraphQLType(IsKey = true)]
    public int Id { get; set; }

    public string Name { get; set; }
    public string Email { get; set; }
}

// Order Service (references other services)
[GraphQLType]
public class Order
{
    [GraphQLType(IsKey = true)]
    public int Id { get; set; }

    public int UserId { get; set; }
    public int ProductId { get; set; }

    // References from other services
    [GraphQLField]
    public async Task<User> GetUser([Service] OrderContext context)
    {
        return await context.UserService.GetUserById(UserId);
    }

    [GraphQLField]
    public async Task<Product> GetProduct([Service] OrderContext context)
    {
        return await context.ProductService.GetProductById(ProductId);
    }
}
```

### Federation in Action

```graphql
# Client query across federated services
query {
  userById(id: 1) {
    name
    email
    orders {  # Automatically fetches from Order Service
      id
      quantity
      product {  # Automatically fetches from Product Service
        name
        price
      }
    }
  }
}

# Response: Combines data from all 3 services seamlessly!
{
  "data": {
    "userById": {
      "name": "John",
      "email": "john@example.com",
      "orders": [
        {
          "id": 1,
          "quantity": 2,
          "product": {
            "name": "Laptop",
            "price": 999.99
          }
        }
      ]
    }
  }
}
```

### When to Use Apollo Federation

✅ Microservices architecture
✅ Multiple teams (each owns GraphQL service)
✅ Need to combine multiple APIs
✅ Scale incrementally

❌ Monolith (just use one GraphQL service)
❌ Simple API (overhead not worth it)

---

## 7️⃣ Advanced Patterns

### A. Fragments (Code Reuse)

**Problem:** Query same fields multiple times

```graphql
# WITHOUT fragments (repetitive)
{
  product1: productById(id: 1) {
    id
    name
    price
    category
    stockQuantity
  }
  product2: productById(id: 2) {
    id
    name
    price
    category
    stockQuantity
  }
}

# WITH fragments (clean!)
fragment ProductDetails on Product {
  id
  name
  price
  category
  stockQuantity
}

{
  product1: productById(id: 1) {
    ...ProductDetails
  }
  product2: productById(id: 2) {
    ...ProductDetails
  }
}
```

### B. Variables (Parameterized Queries)

**Best Practice:** Never hardcode values

```graphql
# ❌ BAD: Hardcoded values
query {
  productsByCategory(category: "Electronics") {
    name
    price
  }
}

# ✅ GOOD: Use variables
query GetByCategory($category: String!) {
  productsByCategory(category: $category) {
    name
    price
  }
}

# Client sends:
{
  "query": "query GetByCategory($category: String!) { ... }",
  "variables": { "category": "Electronics" }
}
```

### C. Directives (Conditional Fields)

```graphql
# Include field conditionally
query GetProduct($showDescription: Boolean!) {
  productById(id: 1) {
    name
    price
    description @include(if: $showDescription)  # Only if true
  }
}

# Skip field conditionally
query GetProduct($hideStock: Boolean!) {
  productById(id: 1) {
    name
    price
    stockQuantity @skip(if: $hideStock)  # Only if false
  }
}
```

### D. Custom Directives

```csharp
// Define custom directive
[GraphQLType]
public class CacheDirective : DirectiveType
{
    protected override void Configure(IDirectiveTypeDescriptor descriptor)
    {
        descriptor
            .Name("cache")
            .Location(DirectiveLocation.FieldDefinition);
    }
}

// Use on resolvers
public class ProductQuery
{
    [Cache(Duration = 300)]  // Cache for 5 minutes
    public async Task<List<Product>> GetProducts([Service] IProductService service)
    {
        return await service.GetAllProductsAsync();
    }
}
```

### E. Batch Loading (N+1 Prevention)

```csharp
// Define batch loader
public class ProductBatchLoader : BatchDataLoader<int, Product>
{
    private readonly IProductService _service;

    public ProductBatchLoader(IProductService service)
    {
        _service = service;
    }

    protected override async Task<IReadOnlyDictionary<int, Product>> LoadBatchAsync(
        IReadOnlyList<int> keys,
        CancellationToken cancellationToken)
    {
        var products = await _service.GetProductsByIdsAsync(keys);
        return products.ToDictionary(p => p.Id);
    }
}

// Use in resolver
public class OrderQuery
{
    public async Task<Product> GetProduct(
        int id,
        ProductBatchLoader loader)  // Automatically batches requests
    {
        return await loader.LoadAsync(id);
    }
}
```

---

## 8️⃣ Interview Preparation

### Top 10 GraphQL Interview Questions

**Q1: What is GraphQL and how is it different from REST?**

*Answer Structure:*
- GraphQL = Query language for APIs (REST = fixed endpoints)
- Clients request EXACT fields needed
- No over/under-fetching
- Single endpoint vs multiple REST endpoints
- Self-documenting schema
- Better for mobile apps (less bandwidth)

*Real Example:*
"In our ProductCatalogAPI, when a mobile app needs product name + price only, GraphQL returns just those 2 fields (50 bytes), while REST returns all fields (300 bytes). 6x smaller response!"

---

**Q2: What are Queries, Mutations, and Subscriptions?**

*Answer Structure:*
- **Queries**: Read data (like GET in REST)
- **Mutations**: Modify data (like POST/PUT/DELETE in REST)
- **Subscriptions**: Real-time updates via WebSocket
- All three in single Query Language

*Real Example from App:*
```graphql
# Query - read
query { products { name price } }

# Mutation - write
mutation { createProduct(input: {...}) { id } }

# Subscription - real-time (not in our app yet)
subscription { productCreated { name } }
```

---

**Q3: What is a GraphQL Schema and Introspection?**

*Answer Structure:*
- Schema = Contract between client and API
- Defines all queries, mutations, types, fields
- Introspection = Querying the schema itself
- Enables auto-complete, code generation, documentation

*Real Example:*
```graphql
# Ask schema: "What queries exist?"
{
  __schema {
    queryType {
      fields { name }
    }
  }
}
```

---

**Q4: What are Resolvers?**

*Answer Structure:*
- Resolver = Function that fetches value for field
- Every field needs resolver
- Can be manual or auto-generated
- Called by GraphQL runtime

*Real Example:*
```csharp
// This method IS a resolver
public async Task<Product> GetProductById(int id, [Service] IProductService service)
{
    return await service.GetProductByIdAsync(id);  // Resolves productById field
}
```

---

**Q5: How do you handle the N+1 Query Problem in GraphQL?**

*Answer Structure:*
- N+1 Problem: 1 query + N sub-queries
- Solution 1: Batch loaders
- Solution 2: DataLoader pattern
- Solution 3: Eager loading

*Real Example:*
- Bad: Get products (1 query), then for each product get category (N queries) = 1+N
- Good: Get products with categories pre-loaded (1 query only)

---

**Q6: What is Apollo Federation?**

*Answer Structure:*
- Multiple GraphQL services combined into 1 schema
- Each service is independent and owned by team
- Apollo Gateway combines them
- Useful for microservices

*Real Example:*
- Service 1: Products API
- Service 2: Users API
- Service 3: Orders API
- Federation lets client query across all 3 seamlessly

---

**Q7: What types can be Nullable vs Non-Nullable?**

*Answer Structure:*
- `String!` = Non-nullable (always has value)
- `String` = Nullable (can be null)
- `[String!]!` = Non-null list of non-null strings
- `String = Null list or list with nulls
- Type safety!

---

**Q8: How do you prevent over-fetching and under-fetching?**

*Answer Structure:*
- Over-fetching: Client gets extra fields not needed
  - GraphQL: Client specifies exact fields → No over-fetching
- Under-fetching: Client needs multiple requests
  - GraphQL: Nested relationships in single query → No under-fetching

---

**Q9: What are the advantages of GraphQL for client applications?**

*Answer Structure:*
- Request EXACT data needed
- Smaller responses (less bandwidth)
- Better performance
- Self-documenting (schema is docs)
- No API versioning needed
- Great for mobile apps

---

**Q10: When should you use GraphQL vs REST?**

*Answer Structure:*
- **Use GraphQL**: Multiple clients, varying data needs, mobile apps, complex relationships
- **Use REST**: Simple APIs, file uploads, caching is important, team knows REST well

---

### How to Describe Your ProjectCatalogAPI in Interview

**Pitch:**
"I built a ProductCatalogAPI with three data access approaches:

1. **EF Core (ORM)** - High DX, moderate performance (150ms)
   - LINQ queries, auto-mapping, change tracking
   - Best for rapid development

2. **ADO.NET (Raw SQL)** - High performance, low DX (50ms)
   - Parameterized queries, manual mapping
   - Best for complex reports, stored procedures

3. **GraphQL (Query Language)** - Flexible queries, excellent DX (80ms)
   - Clients request exact fields needed
   - Self-documenting schema
   - No over/under-fetching

All three access the same ProductCatalogDB database, demonstrating how different architectural approaches solve the same problem with different trade-offs."

**Why it's interview gold:**
✅ Shows understanding of multiple approaches
✅ Discusses trade-offs (performance vs DX)
✅ Practical hands-on experience
✅ Knowledge of caching, middleware, DI
✅ Can show working code

---

## 9️⃣ ProductCatalogAPI Examples

### Complete Schema

```graphql
type Query {
  # Get all products
  products: [Product!]!

  # Get product by ID
  productById(id: Int!): Product

  # Get products by category
  productsByCategory(category: String!): [Product!]!

  # Get products above price threshold
  expensiveProducts(minPrice: Float!): [Product!]!

  # Get products below stock threshold
  lowStockProducts(threshold: Int!): [Product!]!
}

type Mutation {
  # Create new product
  createProduct(input: CreateProductInput!): Product!

  # Update product details
  updateProduct(id: Int!, input: UpdateProductInput!): Product

  # Delete product (soft delete)
  deleteProduct(id: Int!): DeleteProductResponse!

  # Adjust stock quantity
  updateStock(id: Int!, quantity: Int!): Product
}

type Product {
  id: Int!
  name: String!
  description: String
  price: Float!
  stockQuantity: Int!
  category: String!
  isActive: Boolean!
  createdDate: DateTime!
  updatedDate: DateTime!
}

input CreateProductInput {
  name: String!
  description: String
  price: Float!
  stockQuantity: Int!
  category: String!
}

input UpdateProductInput {
  name: String!
  description: String
  price: Float!
  stockQuantity: Int!
  category: String!
}

type DeleteProductResponse {
  success: Boolean!
  message: String!
}
```

### Real Query Examples

**1. Get product with minimal data (mobile)**
```graphql
{
  productById(id: 1) {
    name
    price
  }
}
```

**2. Get product with all details (admin)**
```graphql
{
  productById(id: 1) {
    id
    name
    description
    price
    stockQuantity
    category
    isActive
    createdDate
    updatedDate
  }
}
```

**3. Get all products in category with details**
```graphql
{
  productsByCategory(category: "Electronics") {
    id
    name
    price
    stockQuantity
  }
}
```

**4. Find deals (products over $500 and low stock)**
```graphql
{
  expensive: expensiveProducts(minPrice: 500) {
    id
    name
    price
  }
  lowStock: lowStockProducts(threshold: 10) {
    id
    name
    stockQuantity
  }
}
```

### Real Mutation Examples

**1. Create product with auto-response**
```graphql
mutation {
  createProduct(input: {
    name: "Gaming Laptop"
    description: "RTX 4090, 32GB RAM"
    price: 2499.99
    stockQuantity: 5
    category: "Electronics"
  }) {
    id
    name
    price
  }
}
```

**2. Update stock and get updated data**
```graphql
mutation {
  updateStock(id: 1, quantity: 50) {
    id
    name
    price
    stockQuantity
  }
}
```

### Code Behind Examples

**ProductQuery.cs:**
```csharp
public class ProductQuery
{
    // ← Resolver for "products" query
    public async Task<List<Product>> GetProducts(
        [Service] IProductService productService)
    {
        Console.WriteLine("[GraphQL] Query: GetProducts");
        return await productService.GetAllProductsAsync();
    }

    // ← Resolver for "productById" query
    public async Task<Product?> GetProductById(
        int id,  // ← Argument from GraphQL query
        [Service] IProductService productService)
    {
        Console.WriteLine($"[GraphQL] Query: GetProductById({id})");
        return await productService.GetProductByIdAsync(id);
    }

    // ← Resolver for "expensiveProducts" query
    public async Task<List<Product>> GetExpensiveProducts(
        decimal minPrice,  // ← Argument from GraphQL query
        [Service] IProductService productService)
    {
        Console.WriteLine($"[GraphQL] Query: GetExpensiveProducts(minPrice: {minPrice})");
        var allProducts = await productService.GetAllProductsAsync();
        return allProducts
            .Where(p => p.Price >= minPrice)
            .OrderByDescending(p => p.Price)
            .ToList();
    }
}
```

**ProductMutation.cs:**
```csharp
public class ProductMutation
{
    // ← Resolver for "createProduct" mutation
    public async Task<Product> CreateProduct(
        CreateProductInput input,  // ← Input type
        [Service] IProductService productService)
    {
        Console.WriteLine($"[GraphQL] Mutation: CreateProduct({input.Name})");

        var product = new Product
        {
            Name = input.Name,
            Description = input.Description ?? "",
            Price = input.Price,
            StockQuantity = input.StockQuantity,
            Category = input.Category
        };

        return await productService.CreateProductAsync(product);
    }

    // ← Resolver for "updateStock" mutation
    public async Task<Product?> UpdateStock(
        int id,           // ← Argument 1
        int quantity,     // ← Argument 2
        [Service] IProductService productService)
    {
        Console.WriteLine($"[GraphQL] Mutation: UpdateStock({id}, {quantity})");

        var success = await productService.UpdateStockAsync(id, quantity);
        if (!success) return null;

        return await productService.GetProductByIdAsync(id);
    }
}
```

---

## 🎓 Quick Reference

### GraphQL vs REST Comparison

| Aspect | REST | GraphQL |
|--------|------|---------|
| **Endpoints** | Many (`/products`, `/categories`, etc.) | Single (`/graphql`) |
| **Data Fetching** | Fixed fields (over/under-fetch) | Requested fields only |
| **Multiple resources** | Multiple requests | Single query (nested) |
| **Caching** | Easy (URL-based) | Harder (POST request) |
| **File upload** | Easy (multipart/form-data) | Complex |
| **Learning curve** | Easy | Medium |
| **Performance** | Good | Excellent (less data) |
| **Mobile apps** | Wasteful (bandwidth) | Ideal (minimal data) |

### Common GraphQL Patterns

```graphql
# Pattern 1: Fragment for reuse
fragment ProductInfo on Product { id name price }
{ product1: productById(id: 1) { ...ProductInfo } }

# Pattern 2: Variables for params
query GetProduct($id: Int!) { productById(id: $id) { name } }

# Pattern 3: Multiple queries in one
{ products { name } expensiveProducts(minPrice: 500) { name } }

# Pattern 4: Aliases (rename fields)
{ laptop: productById(id: 1) { name }, mouse: productById(id: 2) { name } }

# Pattern 5: Directives (conditional)
query { productById(id: 1) { name description @skip(if: true) } }
```

---

## ✅ Learning Checklist

- [ ] Understand Query vs Mutation vs Subscription
- [ ] Know Scalars: String, Int, Float, Boolean, ID
- [ ] Understand Non-null types (!)
- [ ] Know what Resolvers are
- [ ] Understand Schema and Introspection
- [ ] Can write Fragment, Variables, Aliases
- [ ] Know Apollo Federation concept
- [ ] Understand N+1 query problem
- [ ] Can describe ProjectCatalogAPI examples
- [ ] Can answer top 10 interview questions

---

## 🚀 Next Steps

1. **Test all queries** in Banana Cake Pop
2. **Write unit tests** for GraphQL operations
3. **Optimize resolvers** with batching
4. **Add subscriptions** for real-time features
5. **Prepare interview story** about this project

---

**Ready for interviews!** 🎯
