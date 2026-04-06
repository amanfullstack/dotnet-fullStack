# MVC Learning Guide

## What is MVC?

**MVC** = Model-View-Controller, a design pattern that separates an application into three interconnected components:

- **Model** - Represents data and business logic
- **View** - Displays data to users (HTML/Razor templates)
- **Controller** - Handles user input and orchestrates model/view

## MVC vs Web API

| Aspect | MVC | Web API |
|--------|-----|---------|
| **Output** | HTML (server-side rendering) | JSON/XML (REST) |
| **Request** | Form submission, HTML links | HTTP requests (GET/POST/PUT/DELETE) |
| **Use Case** | Traditional web apps, websites | APIs, mobile apps, SPAs |
| **Performance** | Slower (server renders HTML) | Faster (less processing) |
| **Complexity** | Simpler for beginners | Better for scalability |

### This Project: MVC + Web API

```
Browser → MVC Controller → Web API Service → REST API → Database
```

We use **MVC for UI** and **Web API for backend**, giving us the best of both worlds:
- Server-side rendering for instant feedback
- Clean separation of concerns
- Easy to understand request flow

## Key Concepts

### 1. Controllers

A Controller is a C# class that handles HTTP requests and returns responses.

```csharp
public class ProductsController : Controller
{
    // GET /Products/Index
    public async Task<IActionResult> Index()
    {
        var products = await _productService.GetAllProductsAsync();
        return View(products); // Returns Index.cshtml with data
    }
}
```

**Types of Returns:**
- `View(model)` - Render Razor template
- `RedirectToAction()` - Redirect to another action
- `NotFound()` - HTTP 404
- `Json(data)` - Return JSON

### 2. Views (Razor Templates)

Views are HTML templates with C# code (`@` syntax):

```html
@model List<Product>

@foreach (var product in Model)
{
    <div class="product-card">
        <h3>@product.Name</h3>
        <p>Price: $@product.Price</p>
    </div>
}
```

**Key Features:**
- `@Model` - Access passed data
- `@if`, `@for`, `@foreach` - C# statements in HTML
- `asp-for="Property"` - Model binding for forms
- `asp-action="Action"` - Link HTML helpers

### 3. Models

Models represent your data:

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public string Category { get; set; }
}
```

### 4. Dependency Injection (DI)

DI automatically provides dependencies to classes:

```csharp
// Register in Program.cs
builder.Services.AddScoped<IProductService, ProductService>();

// Use in Controller
public ProductsController(IProductService productService)
{
    _productService = productService; // Automatically injected!
}
```

**Benefits:**
- Easy to test (inject mocks)
- Loose coupling
- Centralized configuration

### 5. Routing

Routes map URLs to Controller actions:

```csharp
// In Program.cs
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Products}/{action=Index}/{id?}");
```

**URL Patterns:**
- `/Products` → ProductsController.Index()
- `/Products/Details/5` → ProductsController.Details(5)
- `/Products/Create` → ProductsController.Create()

### 6. Form Binding

Models automatically bind HTML form data:

```html
<form asp-action="Create" method="post">
    <input asp-for="Name" />
    <input asp-for="Price" />
    <button type="submit">Submit</button>
</form>
```

When submitted:
```csharp
[HttpPost]
public async Task<IActionResult> Create(Product product)
{
    // product.Name and product.Price are populated automatically!
    // This is called MODEL BINDING
}
```

## Request Lifecycle in This Project

### 1. User clicks "Create Product"

```
Browser: GET /Products/Create
```

### 2. Controller returns view with form

```csharp
public IActionResult Create()
{
    return View(); // Returns Create.cshtml with empty form
}
```

### 3. User submits form

```
Browser: POST /Products/Create
Body: name=Laptop&price=999.99&category=Electronics
```

### 4. Controller receives data

```csharp
[HttpPost]
public async Task<IActionResult> Create(Product product)
{
    // Model binding: product is automatically populated
    // product.Name = "Laptop"
    // product.Price = 999.99
    // product.Category = "Electronics"
}
```

### 5. Service sends to API

```csharp
var created = await _productService.CreateProductAsync(product);
```

Service makes HTTP call:
```csharp
var content = JsonContent.Create(product);
var response = await _httpClient.PostAsync("api/products", content);
```

### 6. API stores in database, returns response

### 7. Controller redirects user

```csharp
TempData["SuccessMessage"] = "Product created!";
return RedirectToAction(nameof(Index));
```

### 8. Browser shows products list

## Architecture Pattern: N-Tier

This project follows a 3-tier architecture:

```
┌─────────────────────┐
│   View Tier         │  ← Razor templates, HTML, CSS, JavaScript
│  (Presentation)     │
└──────────────┬──────┘
               │
┌──────────────▼──────────┐
│   Business Logic Tier   │  ← Controllers, Services
│   (Application)         │
└──────────────┬──────────┘
               │
┌──────────────▼──────────┐
│   Data Access Tier      │  ← ProductCatalogAPI
│   (Persistence)         │
└─────────────────────────┘
```

**Benefits:**
- Separation of concerns
- Easy to tests layers independently
- Easy to swap implementations

## Best Practices Used

✅ **1. Interface-Based Design**
```csharp
// Good: Depend on interface
public ProductsController(IProductService service)
{
    _service = service;
}

// Bad: Depend on concrete class
public ProductsController(ProductService service)
{
    _service = service;
}
```

✅ **2. Async/Await Pattern**
```csharp
// Good: Non-blocking I/O
public async Task<IActionResult> Index()
{
    var products = await _productService.GetAllProductsAsync();
    return View(products);
}

// Bad: Synchronous blocking
public IActionResult Index()
{
    var products = _productService.GetAllProducts();
    return View(products);
}
```

✅ **3. Error Handling**
```csharp
[HttpPost]
public async Task<IActionResult> Create(Product product)
{
    if (ModelState.IsValid)
    {
        var created = await _productService.CreateProductAsync(product);
        if (created != null)
        {
            TempData["SuccessMessage"] = "Product created!";
            return RedirectToAction(nameof(Index));
        }
        ModelState.AddModelError("", "Failed to create product");
    }
    return View(product); // Redisplay form with errors
}
```

✅ **4. Form Validation**
```csharp
public class Product
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }
}
```

## Common Patterns

### Pattern 1: List + Filter

```csharp
public async Task<IActionResult> Index(string search = "", string category = "")
{
    var products = await _productService.GetAllProductsAsync();

    if (!string.IsNullOrEmpty(search))
        products = products.Where(p => p.Name.Contains(search)).ToList();

    if (!string.IsNullOrEmpty(category))
        products = products.Where(p => p.Category == category).ToList();

    return View(products);
}
```

### Pattern 2: CRUD Operations

```csharp
// GET for form display
public async Task<IActionResult> Edit(int id)
{
    var product = await _productService.GetProductByIdAsync(id);
    return View(product);
}

// POST for form submission
[HttpPost]
public async Task<IActionResult> Edit(int id, Product product)
{
    if (ModelState.IsValid)
    {
        await _productService.UpdateProductAsync(id, product);
        return RedirectToAction(nameof(Index));
    }
    return View(product);
}
```

### Pattern 3: Success/Error Messages

```csharp
// Set message
TempData["SuccessMessage"] = "Operation completed!";
return RedirectToAction(...);

// Display in layout
@if (TempData["SuccessMessage"] != null)
{
    <div class="alert alert-success">@TempData["SuccessMessage"]</div>
}
```

## Testing MVC Applications

### Unit Testing (Controllers)

```csharp
[Test]
public async Task Index_ReturnsViewWithProductList()
{
    // Arrange
    var mockService = new Mock<IProductService>();
    mockService.Setup(s => s.GetAllProductsAsync())
        .ReturnsAsync(new List<Product> { new Product { Id = 1 } });

    var controller = new ProductsController(mockService.Object);

    // Act
    var result = await controller.Index();

    // Assert
    Assert.IsInstanceOf<ViewResult>(result);
}
```

### Integration Testing

```csharp
[Test]
public async Task CreateProduct_StoresInDatabase()
{
    // Use test database or mock
    // Send POST request to /Products/Create
    // Verify product exists in database
}
```

## Troubleshooting

**Problem:** "No route matched" error
```
Solution: Check routing configuration in Program.cs
```

**Problem:** Model not binding from form
```
Solution: Ensure HTML input names match property names (case-insensitive)
<input name="Name" /> binds to Product.Name ✓
<input name="ProductName" /> binds to Product.Name ✗
```

**Problem:** TempData not persisting across redirect
```
Solution: Ensure session is configured in Program.cs
builder.Services.AddSession();
app.UseSession();
```

## Going Deeper

Learn more:
- Microsoft Docs: https://docs.microsoft.com/en-us/aspnet/mvc/
- Routing: https://docs.microsoft.com/en-us/aspnet/core/mvc/controllers/routing
- Model Binding: https://docs.microsoft.com/en-us/aspnet/core/mvc/models/model-binding
- Dependency Injection: https://docs.microsoft.com/en-us/dotnet/core/extensions/dependency-injection

## Next Steps

1. **Modify views** - Customize HTML and styling
2. **Add validation** - Use data annotations
3. **Implement caching** - Use IMemoryCache
4. **Add logging** - Use ILogger
5. **Deploy** - To Azure or on-premises

---

**Questions?** Check PR `MVC_DOCUMENTATION.md` for complete API reference or create an issue on GitHub.
