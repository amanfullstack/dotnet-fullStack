# ⚙️ HotChocolate Setup & Configuration Guide

**Quick reference for setting up GraphQL with HotChocolate in .NET projects**

---

## Installation & Setup

### Step 1: Add NuGet Packages

```bash
cd ProductCatalogAPI-WebAPI-EFCore
dotnet add package HotChocolate.AspNetCore --version 15.1.13
dotnet add package HotChocolate.Types --version 15.1.13
```

Or manually edit `.csproj`:
```xml
<ItemGroup>
  <PackageReference Include="HotChocolate.AspNetCore" Version="15.1.13" />
  <PackageReference Include="HotChocolate.Types" Version="15.1.13" />
</ItemGroup>
```

### Step 2: Configure in Program.cs

```csharp
// Program.cs

var builder = WebApplication.CreateBuilder(args);

// Register GraphQL services
builder.Services
    .AddGraphQLServer()
    .AddQueryType<ProductQuery>()           // Our queries
    .AddMutationType<ProductMutation>()    // Our mutations
    .AddErrorFilter(error =>
    {
        Console.WriteLine($"[GraphQL Error] {error.Exception?.Message}");
        return error;
    });

// Register other services
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddControllers();

var app = builder.Build();

// Add GraphQL middleware
app.MapGraphQL("/graphql");  // Accessible at http://localhost:5000/graphql

app.MapControllers();
app.Run();
```

### Step 3: Create Query Type

```csharp
// File: GraphQL/ProductQuery.cs

using ProductCatalogAPI.Models;
using ProductCatalogAPI.Services;
using HotChocolate;

namespace ProductCatalogAPI.GraphQL
{
    public class ProductQuery
    {
        public async Task<List<Product>> GetProducts(
            [Service] IProductService productService)
        {
            Console.WriteLine("[GraphQL] Query: GetProducts");
            return await productService.GetAllProductsAsync();
        }

        public async Task<Product?> GetProductById(
            int id,
            [Service] IProductService productService)
        {
            Console.WriteLine($"[GraphQL] Query: GetProductById({id})");
            return await productService.GetProductByIdAsync(id);
        }
    }
}
```

### Step 4: Create Mutation Type

```csharp
// File: GraphQL/ProductMutation.cs

using ProductCatalogAPI.Models;
using ProductCatalogAPI.Services;
using HotChocolate;

namespace ProductCatalogAPI.GraphQL
{
    public class ProductMutation
    {
        public async Task<Product> CreateProduct(
            CreateProductInput input,
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
    }
}
```

### Step 5: Create Input Types

```csharp
// File: GraphQL/ProductQuery.cs (append to file)

// Input types for mutations
public class CreateProductInput
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string Category { get; set; } = string.Empty;
}

public class UpdateProductInput
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string Category { get; set; } = string.Empty;
}

public class DeleteProductResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}
```

---

## Testing

### Test 1: Access Playground

```bash
dotnet run
# Open browser: http://localhost:5000/graphql
```

Click "Play" button, then paste:
```graphql
{
  products {
    id
    name
    price
  }
}
```

### Test 2: Test Query with curl

```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ products { id name price } }"}'
```

### Test 3: Test Mutation with curl

```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createProduct(input: { name: \"Keyboard\", price: 149.99, stockQuantity: 25, category: \"Electronics\" }) { id name price } }"
  }'
```

---

## Configuration Options

### Error Filtering

```csharp
builder.Services
    .AddGraphQLServer()
    .AddErrorFilter(error =>
    {
        if (error.Exception is MyCustomException ex)
        {
            return error.WithMessage("Custom error message");
        }
        return error;
    });
```

### Authentication

```csharp
builder.Services
    .AddGraphQLServer()
    .AddAuthorization();  // Requires [Authorize] attribute

// In Query resolvers:
[Authorize]
public async Task<List<Product>> GetProducts([Service] IProductService service)
{
    return await service.GetAllProductsAsync();
}
```

### Custom Scalar Types

```csharp
builder.Services
    .AddGraphQLServer()
    .BindRuntimeType<DateTime>(ScalarTypes.DateTime)
    .BindRuntimeType<decimal>(ScalarTypes.Decimal)
    .BindRuntimeType<Guid>(ScalarTypes.UUID);
```

### Subscription Support

```csharp
// Install additional package
dotnet add package HotChocolate.Subscriptions

builder.Services
    .AddGraphQLServer()
    .AddSubscriptionType<ProductSubscription>();

// Usage
public class ProductSubscription
{
    [Subscribe]
    public async IAsyncEnumerable<Product> ProductCreated(
        [Service] IProductService service)
    {
        // Real-time subscription
        yield return await service.GetLatestProductAsync();
    }
}
```

---

## Common Attributes

```csharp
// Make field non-nullable
[GraphQLType(IsRequired = true)]
public string Name { get; set; }

// Add description
[GraphQLDescription("The product name")]
public string Name { get; set; }

// Rename field
[GraphQLName("productName")]
public string Name { get; set; }

// Skip field from schema
[GraphQLIgnore]
public string InternalField { get; set; }

// Authorize query
[Authorize]
public async Task<Product> GetSecureData([Service] IProductService service) { ... }

// Add deprecation
[GraphQLDeprecated("Use GetProductById instead")]
public async Task<Product> GetProduct(int id) { ... }
```

---

## Performance Tuning

### Enable Query Complexity Analysis

```csharp
builder.Services
    .AddGraphQLServer()
    .AddComplexityAnalyzer()
    .ModifyRequestOptions(opt => opt.MaxOperationComplexity = 100);
```

### Enable Query Caching

```csharp
builder.Services
    .AddGraphQLServer()
    .AddQueryCaching();
```

### Batch DataLoader

```csharp
// Install
dotnet add package GreenDonut

// Use in resolvers
public class ProductQuery
{
    public async Task<Product> GetProduct(int id, ProductBatchLoader loader)
    {
        return await loader.LoadAsync(id);
    }
}
```

---

## Common Issues & Solutions

**Issue 1: "GraphQL Playground not loading"**
- Solution: Ensure `app.MapGraphQL("/graphql")` is in Program.cs BEFORE `app.MapControllers()`

**Issue 2: "Cannot resolve service 'IProductService'"**
- Solution: Register service in Program.cs: `builder.Services.AddScoped<IProductService, ProductService>()`

**Issue 3: "Field 'productById' not found"**
- Solution: Add method to ProductQuery class or check method name matches GraphQL name

**Issue 4: "Complex object in response showing null"**
- Solution: Ensure all complex types are registered: `AddObjectType<Product>()`

---

## File Structure

```
ProductCatalogAPI-WebAPI-EFCore/
├── GraphQL/
│   ├── ProductQuery.cs          ← Queries + input types
│   ├── ProductMutation.cs       ← Mutations
│   └── ProductSubscription.cs   ← Subscriptions (optional)
├── Controllers/
│   ├── ProductsController.cs
│   └── AdoProductsController.cs
├── Services/
│   ├── IProductService.cs
│   └── ProductService.cs
├── Program.cs                    ← Add GraphQL config
└── ProductCatalogAPI.csproj
```

---

## Summary

✅ Install HotChocolate packages
✅ Configure in Program.cs
✅ Create Query type
✅ Create Mutation type
✅ Test in Banana Cake Pop
✅ Add error handling

Ready to go! 🚀
