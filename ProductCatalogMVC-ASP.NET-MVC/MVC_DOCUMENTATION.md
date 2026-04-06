# ASP.NET MVC Complete Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Controllers](#controllers)
4. [Models](#models)
5. [Views](#views)
6. [Services](#services)
7. [Middleware & Configuration](#middleware--configuration)
8. [API Integration](#api-integration)
9. [Error Handling](#error-handling)
10. [Theme Implementation](#theme-implementation)

---

## Architecture Overview

### MVC Pattern
The application follows the **Model-View-Controller** pattern:
- **Models** - Data entities and view models
- **Views** - Razor templates for HTML rendering
- **Controllers** - Handle HTTP requests and business logic

### Request Flow
```
Browser Request
    ↓
Routing (program.cs)
    ↓
Controller Action
    ↓
Service Layer (ProductService)
    ↓
HTTP Call to ProductCatalogAPI
    ↓
Response Processing
    ↓
View Rendering
    ↓
HTML Response to Browser
```

### Technology Stack
- **Framework:** ASP.NET MVC 8 (.NET 8.0)
- **Language:** C# 12
- **HTTP Client:** HttpClientFactory
- **Views:** Razor (.cshtml)
- **Styling:** Bootstrap 5 + Custom CSS
- **Theme:** CSS Variables (Light/Dark)

---

## Project Structure

```
ProductCatalogMVC-ASP.NET-MVC/
├── Controllers/
│   └── ProductsController.cs             # Main CRUD controller (6 actions)
├── Models/
│   ├── Product.cs                        # Entity model matching API
│   └── ProductViewModel.cs               # Form input model
├── Views/
│   ├── Shared/
│   │   ├── _Layout.cshtml              # Master layout template
│   │   └── _ValidationScriptsPartial.cshtml  # Client-side validation
│   └── Products/
│       ├── Index.cshtml                 # Product list view
│       ├── Create.cshtml                # New product form
│       ├── Edit.cshtml                  # Edit product form
│       ├── Delete.cshtml                # Delete confirmation
│       └── Details.cshtml               # Product detail view
├── Services/
│   ├── IProductService.cs               # Service interface
│   └── ProductService.cs                # HTTP client to API
├── wwwroot/
│   ├── css/
│   │   ├── site.css                    # Main stylesheet
│   │   └── theme.css                   # Dark/light theme
│   └── js/
│       └── theme.js                    # Theme toggle functionality
├── Program.cs                           # Startup & DI configuration
├── appsettings.json                     # Configuration
└── ProductCatalogMVC.csproj             # Project file
```

---

## Controllers

### ProductsController

**Location:** `Controllers/ProductsController.cs`

#### Actions

##### 1. Index (GET/POST)
**Route:** `/Products` or `/`

**GET - Display List:**
```csharp
public async Task<IActionResult> Index(string? searchTerm = null, string? categoryFilter = null)
{
    var products = await _productService.GetAllProductsAsync();
    // Filter by searchTerm (name)
    // Filter by categoryFilter
    // Return to view
}
```

**POST - Handle Search:**
```csharp
[HttpPost]
public async Task<IActionResult> Index(string searchTerm, string categoryFilter)
{
    // Search logic
    // Redirect to GET with query parameters
}
```

**Parameters:**
- `searchTerm` - Filter products by name (case-insensitive)
- `categoryFilter` - Filter products by category

**View Model:** List of products + search filters

---

##### 2. Create (GET/POST)
**Route:** `/Products/Create`

**GET - Display Form:**
```csharp
public IActionResult Create()
{
    var model = new ProductViewModel();
    return View(model);
}
```

**POST - Save Product:**
```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> Create(ProductViewModel model)
{
    if (!ModelState.IsValid)
        return View(model);

    var newProduct = await _productService.CreateProductAsync(model);
    TempData["Success"] = "Product created successfully!";
    return RedirectToAction(nameof(Index));
}
```

**Model Validation:**
- `Name` - Required, max 100 characters
- `Price` - Required, must be > 0
- `Category` - Optional
- `Description` - Optional

**Error Handling:**
- ModelState errors shown in view
- API exceptions caught and displayed as errors

---

##### 3. Edit (GET/POST)
**Route:** `/Products/Edit/{id}`

**GET - Load Product:**
```csharp
public async Task<IActionResult> Edit(int id)
{
    var product = await _productService.GetProductByIdAsync(id);
    if (product == null)
        return NotFound();

    var model = new ProductViewModel { ... };
    return View(model);
}
```

**POST - Update Product:**
```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> Edit(int id, ProductViewModel model)
{
    if (!ModelState.IsValid)
        return View(model);

    await _productService.UpdateProductAsync(id, model);
    TempData["Success"] = "Product updated successfully!";
    return RedirectToAction(nameof(Details), new { id });
}
```

---

##### 4. Details (GET)
**Route:** `/Products/Details/{id}`

```csharp
public async Task<IActionResult> Details(int id)
{
    var product = await _productService.GetProductByIdAsync(id);
    if (product == null)
        return NotFound();

    return View(product);
}
```

**Returns:** Single product details

---

##### 5. Delete (GET/POST)
**Route:** `/Products/Delete/{id}`

**GET - Show Confirmation:**
```csharp
public async Task<IActionResult> Delete(int id)
{
    var product = await _productService.GetProductByIdAsync(id);
    if (product == null)
        return NotFound();

    return View(product);
}
```

**POST - Confirm Deletion:**
```csharp
[HttpPost]
[ActionName("Delete")]
[ValidateAntiForgeryToken]
public async Task<IActionResult> DeleteConfirmed(int id)
{
    await _productService.DeleteProductAsync(id);
    TempData["Success"] = "Product deleted successfully!";
    return RedirectToAction(nameof(Index));
}
```

---

## Models

### Product Model
**Location:** `Models/Product.cs`

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string Category { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
    public bool IsActive { get; set; }
}
```

**Properties:**
- `Id` - Unique identifier (from API)
- `Name` - Product name (required)
- `Description` - Product description (optional)
- `Price` - Product price (required)
- `StockQuantity` - Available stock count
- `Category` - Product category
- `CreatedDate` - Creation timestamp
- `UpdatedDate` - Last update timestamp
- `IsActive` - Soft delete flag

---

### ProductViewModel
**Location:** `Models/ProductViewModel.cs`

```csharp
public class ProductViewModel
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Product name is required")]
    [StringLength(100, MinimumLength = 2,
        ErrorMessage = "Name must be between 2 and 100 characters")]
    public string Name { get; set; }

    [Display(Name = "Description")]
    public string Description { get; set; }

    [Required(ErrorMessage = "Price is required")]
    [Range(0.01, 1000000, ErrorMessage = "Price must be greater than 0")]
    public decimal Price { get; set; }

    [Display(Name = "Stock Quantity")]
    public int StockQuantity { get; set; }

    [Display(Name = "Category")]
    public string Category { get; set; }
}
```

**Purpose:**
- Separates form input from database entity
- Includes validation rules
- Displays user-friendly error messages

---

## Views

### Shared/_Layout.cshtml
Master layout template included in all views.

**Sections:**
- Top navbar with logo, theme toggle, compiler link
- Main content placeholder
- Success/error message display
- Footer

**Key Elements:**
```html
<!-- Theme Toggle -->
<button class="theme-btn" id="themeBtn">🌙</button>

<!-- Success/Error Messages -->
@if (TempData["Success"] != null) { ... }
@if (TempData["Error"] != null) { ... }
```

---

### Products/Index.cshtml
Displays list of products in a responsive table.

**Features:**
- Search by name
- Filter by category
- Action buttons (Edit, Delete, Details)
- Loading states
- Responsive table wrapper

**Table Structure:**
```html
<table class="table table-hover">
    <thead>
        <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        @foreach (var product in Model) { ... }
    </tbody>
</table>
```

---

### Products/Create.cshtml & Edit.cshtml
Form for creating or editing products.

**Form Fields:**
- Product Name (required text input)
- Description (optional textarea)
- Price (required decimal input)
- Stock Quantity (number input)
- Category (text input dropdown)

**Form Controls:**
```html
<form asp-action="Create" method="post">
    @Html.AntiForgeryToken()

    <div class="form-group">
        <label asp-for="Name"></label>
        <input asp-for="Name" class="form-control" />
        <span asp-validation-for="Name" class="text-danger"></span>
    </div>

    <!-- Other form fields -->

    <button type="submit" class="btn btn-primary">Save</button>
</form>
```

---

### Products/Delete.cshtml
Confirmation page before deletion.

**Shows:**
- Product details (name, price, category)
- Warning message
- Confirm/Cancel buttons

---

### Products/Details.cshtml
Displays detailed view of a single product.

**Shows:**
- Product information (all properties)
- Created/Updated dates
- Stock status
- Edit/Delete/Back buttons

---

## Services

### IProductService Interface
**Location:** `Services/IProductService.cs`

```csharp
public interface IProductService
{
    Task<IEnumerable<Product>> GetAllProductsAsync();
    Task<Product> GetProductByIdAsync(int id);
    Task<IEnumerable<Product>> GetProductsByCategoryAsync(string category);
    Task<Product> CreateProductAsync(ProductViewModel model);
    Task<bool> UpdateProductAsync(int id, ProductViewModel model);
    Task<bool> DeleteProductAsync(int id);
    Task<bool> UpdateStockAsync(int id, int quantity);
}
```

---

### ProductService Implementation
**Location:** `Services/ProductService.cs`

#### Initialization
```csharp
private readonly HttpClient _httpClient;
private readonly ILogger<ProductService> _logger;

public ProductService(HttpClient httpClient, ILogger<ProductService> logger)
{
    _httpClient = httpClient;
    _logger = logger;
}
```

#### Methods

**GetAllProductsAsync**
```csharp
public async Task<IEnumerable<Product>> GetAllProductsAsync()
{
    var response = await _httpClient.GetAsync("api/products");
    response.EnsureSuccessStatusCode();
    var json = await response.Content.ReadAsStringAsync();
    return JsonConvert.DeserializeObject<IEnumerable<Product>>(json);
}
```

**GetProductByIdAsync**
```csharp
public async Task<Product> GetProductByIdAsync(int id)
{
    var response = await _httpClient.GetAsync($"api/products/{id}");
    if (!response.IsSuccessStatusCode)
        return null;

    var json = await response.Content.ReadAsStringAsync();
    return JsonConvert.DeserializeObject<Product>(json);
}
```

**CreateProductAsync**
```csharp
public async Task<Product> CreateProductAsync(ProductViewModel model)
{
    var json = JsonConvert.SerializeObject(model);
    var content = new StringContent(json, Encoding.UTF8, "application/json");

    var response = await _httpClient.PostAsync("api/products", content);
    response.EnsureSuccessStatusCode();

    var responseJson = await response.Content.ReadAsStringAsync();
    return JsonConvert.DeserializeObject<Product>(responseJson);
}
```

**UpdateProductAsync & DeleteProductAsync** - Similar patterns with PUT/DELETE methods

#### Error Handling
- `HttpRequestException` for network errors
- `EnsureSuccessStatusCode()` for HTTP errors
- Logging for debugging

---

## Middleware & Configuration

### Program.cs

**HttpClient Configuration:**
```csharp
services.AddHttpClient<IProductService, ProductService>(client =>
{
    client.BaseAddress = new Uri("http://localhost:5000");
    client.Timeout = TimeSpan.FromSeconds(30);
});
```

**MVC Setup:**
```csharp
services.AddControllersWithViews();
services.AddSession();
```

**Middleware Pipeline:**
```csharp
app.UseRouting();
app.UseSession();
app.UseStaticFiles(); // CSS, JS, images
app.MapControllers();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
```

---

## API Integration

### Base Configuration
**API Base URL:** `http://localhost:5000`

### Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/{id}` | Get product by ID |
| GET | `/api/products/category/{name}` | Get products by category |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| PATCH | `/api/products/{id}/stock` | Update stock |

### Response Format
```json
{
    "id": 1,
    "name": "Product Name",
    "description": "Description",
    "price": 99.99,
    "stockQuantity": 100,
    "category": "Electronics",
    "createdDate": "2024-01-15T10:30:00Z",
    "updatedDate": "2024-01-16T14:45:00Z",
    "isActive": true
}
```

---

## Error Handling

### Try-Catch Pattern
```csharp
try
{
    var product = await _productService.CreateProductAsync(model);
    TempData["Success"] = "Product created successfully!";
}
catch (HttpRequestException ex)
{
    _logger.LogError($"API Error: {ex.Message}");
    TempData["Error"] = "Failed to connect to API";
    return View(model);
}
catch (Exception ex)
{
    _logger.LogError($"Unexpected error: {ex.Message}");
    TempData["Error"] = "An unexpected error occurred";
    return View(model);
}
```

### User Feedback
- **Success Messages:** Using `TempData["Success"]`
- **Error Messages:** Using `TempData["Error"]`
- **Validation Errors:** Displayed in views with `asp-validation-for`

---

## Theme Implementation

### CSS Variables
**File:** `wwwroot/css/theme.css`

**Light Mode (Default):**
```css
:root {
    --color-bg: #ffffff;
    --color-text: #1f2937;
    --color-border: #e5e7eb;
    --color-primary: #0ea5e9;
    --color-success: #10b981;
    --color-danger: #ef4444;
}
```

**Dark Mode:**
```css
:root[data-theme="dark"] {
    --color-bg: #0f172a;
    --color-text: #f3f4f6;
    --color-border: #374151;
    --color-primary: #0ea5e9;
    --color-success: #10b981;
    --color-danger: #ef4444;
}
```

### Theme Toggle
**File:** `wwwroot/js/theme.js`

```javascript
function toggleTheme() {
    const current = localStorage.getItem('theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
}
```

**Storage:** Theme preference saved in `localStorage`

---

## Common Workflows

### Adding a New Product
1. User clicks "Add Product" button
2. GET request to `/Products/Create` displays form
3. User fills form and submits
4. POST request to `/Products/Create` validates input
5. `ProductService.CreateProductAsync()` calls API
6. Response redirected to product list with success message

### Updating a Product
1. User clicks "Edit" on a product
2. GET request to `/Products/Edit/{id}` loads product details
3. Form pre-filled with current values
4. User modifies and submits
5. POST validates and calls `ProductService.UpdateProductAsync()`
6. Redirected to Details page with success message

### Deleting a Product
1. User clicks "Delete" button
2. GET request to `/Products/Delete/{id}` shows confirmation
3. User confirms deletion
4. POST to `/Products/DeleteConfirmed` calls API
5. `ProductService.DeleteProductAsync()` makes DELETE request
6. Redirect to list with success message

---

## Performance Considerations

### Caching (Future Enhancement)
```csharp
[ResponseCache(Duration = 60)]  // Cache for 60 seconds
public async Task<IActionResult> Details(int id)
{
    // This response will be cached
}
```

### Async/Await
All service calls are asynchronous to prevent thread blocking.

### HttpClientFactory
Single HttpClient instance per service prevents socket exhaustion.

---

## Deployment

### Building for Production
```bash
dotnet publish -c Release -o ./publish
```

### Configuration for Production
Update `appsettings.Production.json`:
```json
{
    "ProductCatalogApi": {
        "BaseUrl": "https://api.example.com"
    }
}
```

### Hosting Options
- Azure App Service
- Docker container
- IIS on Windows Server
- Linux with Kestrel + Nginx proxy

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on products page | Verify ProductCatalogAPI is running on localhost:5000 |
| Styling not applied | Clear browser cache, check `wwwroot/css/` files loaded |
| Theme not persisting | Check browser localStorage enabled |
| Validation errors not showing | Verify `asp-validation-for` in view |
| HTTPS certificate error | Run `dotnet dev-certs https --trust` |

---

## Related Documentation
- [README.md](README.md) - Quick start guide
- [LEARNING_GUIDE.md](LEARNING_GUIDE.md) - Conceptual explanations
- [ProductCatalogAPI docs](../ProductCatalogAPI-WebAPI-EFCore/API_DOCUMENTATION.md) - Backend API reference

