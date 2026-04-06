# ProductCatalogMVC - ASP.NET MVC Full Stack Project

A modern ASP.NET MVC 8 application for managing a product catalog. This project demonstrates best practices for web development including server-side rendering, dependency injection, and clean architecture.

**Tech Stack:**
- ASP.NET MVC 8 (.NET 8.0)
- C# 12
- Bootstrap 5 (responsive UI)
- Dark/Light theme support
- Consumes ProductCatalogAPI

## Quick Start

### Prerequisites
- .NET 8.0 SDK installed
- ProductCatalogAPI running on `http://localhost:5000`

### Installation & Running

```bash
# Clone or navigate to the project
cd ProductCatalogMVC-ASP.NET-MVC

# Install dependencies (if needed)
dotnet restore

# Run the project
dotnet run

# The application will start on:
# - http://localhost:5000 (HTTP)
# - https://localhost:5001 (HTTPS)
```

Open your browser and go to **https://localhost:5001**

## Features

✅ **Product Management**
- View all products in a responsive table
- Search products by name
- Filter products by category
- Create new products
- Edit existing products
- View detailed product information
- Delete products (soft delete)

✅ **Modern UI/UX**
- Bootstrap 5 responsive design
- Dark/Light theme toggle
- Smooth transitions and animations
- Mobile-first approach
- Intuitive navigation

✅ **Architecture**
- N-Tier architecture (Controllers → Services → API)
- Dependency Injection (DI) via ASP.NET Core
- Interface-based service layer
- Error handling with user-friendly messages
- TempData for flash messages

## File Structure

```
ProductCatalogMVC-ASP.NET-MVC/
├── Controllers/
│   └── ProductsController.cs      # 6 CRUD actions
├── Models/
│   └── Product.cs                 # Entity & ViewModel
├── Services/
│   └── ProductService.cs          # API communication
├── Views/
│   ├── Shared/
│   │   └── _Layout.cshtml         # Master layout
│   └── Products/
│       ├── Index.cshtml           # List products
│       ├── Create.cshtml          # Create form
│       ├── Edit.cshtml            # Edit form
│       ├── Delete.cshtml          # Delete confirmation
│       └── Details.cshtml         # Product details
├── wwwroot/
│   ├── css/
│   │   ├── theme.css              # Dark/light theme
│   │   └── site.css               # Custom styles
│   └── js/
│       └── theme.js               # Theme toggle
├── Program.cs                     # Startup configuration
├── appsettings.json               # Configuration
└── ProductCatalogMVC.csproj       # Project file
```

## How It Works

### IMPORTANT FLOW #1: Request Flow

```
User Request (Browser)
    ↓
ProductsController
    ↓
ProductService (IProductService)
    ↓
ProductCatalogAPI (HTTP)
    ↓
Response back through layers
    ↓
Razor View renders HTML
    ↓
Response to Browser
```

### IMPORTANT FLOW #2: Dependency Injection

```csharp
// In Program.cs
builder.Services.AddHttpClient<IProductService, ProductService>(client =>
{
    client.BaseAddress = new Uri("http://localhost:5000/");
});

// In Controller
public ProductsController(IProductService productService)
{
    _productService = productService; // Injected automatically
}
```

## Database

This project connects to **ProductCatalogAPI**, which manages the actual database.

The Product entity has these properties:
- `Id` - Unique identifier
- `Name` - Product name (required)
- `Description` - Product description
- `Price` - Product price (decimal)
- `StockQuantity` - Available stock
- `Category` - Product category
- `CreatedDate` - Timestamp created
- `UpdatedDate` - Timestamp last updated
- `IsActive` - Soft delete flag

## API Endpoints Used

This MVC app consumes these ProductCatalogAPI endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/products` | GET | Fetch all products |
| `/api/products/{id}` | GET | Fetch product by ID |
| `/api/products/category/{category}` | GET | Fetch by category |
| `/api/products` | POST | Create product |
| `/api/products/{id}` | PUT | Update product |
| `/api/products/{id}` | DELETE | Delete product |
| `/api/products/{id}/stock` | PATCH | Update stock |

## Theme Implementation

The application includes a smooth dark/light theme toggle:

```csharp
// Theme saved to localStorage
localStorage.setItem('docsTheme', 'dark');

// CSS Variables auto-update
:root[data-theme="dark"] {
    --color-bg: #0f172a;
    --color-text: #f1f5f9;
    /* ... */
}
```

## Common Tasks

### Add a new route/view

1. Add action in `ProductsController.cs`
2. Create corresponding view in `Views/Products/`
3. Update navigation links

### Customize styling

- Edit `wwwroot/css/theme.css` for theme variables
- Edit `wwwroot/css/site.css` for component styles
- All changes apply to both light and dark modes

### Handle errors

```csharp
if (ModelState.IsValid)
{
    var result = await _productService.CreateProductAsync(product);
    if (result != null)
    {
        TempData["SuccessMessage"] = "Product created!";
        return RedirectToAction(nameof(Index));
    }
    else
    {
        ModelState.AddModelError("", "Creation failed");
    }
}
```

## Deployment

### Local IIS
```bash
dotnet publish -c Release
# Upload contents to IIS
```

### Cloud Deployment
- Azure App Service: `dotnet publish` → upload
- Docker: Create Dockerfile, build image

## Testing

### Manual Testing Checklist
- [ ] Create a new product
- [ ] Edit an existing product
- [ ] Delete a product (view confirmation)
- [ ] Search products by name
- [ ] Filter by category
- [ ] Toggle dark/light theme
- [ ] Test on mobile device
- [ ] Verify error handling

## GitHub Repository

View the source code: [View on GitHub](https://github.com/[USER]/dotnet-fullStack/tree/main/ProductCatalogMVC-ASP.NET-MVC)

## Learning Resources

See `LEARNING_GUIDE.md` for detailed explanations of MVC concepts and patterns used in this project.

## License

This project is part of the .NET Full Stack Learning Suite. Free to use for educational purposes.

---

**Questions or Issues?** Create an issue in the GitHub repository or check the main documentation at `/docs/mvc-setup.html`
