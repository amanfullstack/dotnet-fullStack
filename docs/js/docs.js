/* ============================================================
   DOCUMENTATION SYSTEM - ALL CONTENT
   ============================================================ */

// Complete documentation content for all 9 phases
const phaseDocumentation = {
    1: {
        title: "📖 Phase 1: Foundation",
        timeEstimate: "2-3 hours",
        color: "#667eea",
        sections: [
            {
                id: "overview",
                title: "🎯 Phase Overview",
                content: `
                <p><strong>Learning Outcomes:</strong></p>
                <ul>
                    <li>Understand project structure and naming conventions</li>
                    <li>Know all technologies and their versions</li>
                    <li>Grasp N-Tier architecture concept</li>
                    <li>Learn how to set up project from scratch</li>
                </ul>

                <p><strong>Why Foundation Matters:</strong></p>
                <ul>
                    <li>✓ Understanding structure prevents confusion later</li>
                    <li>✓ Knowing the tech stack helps you choose right tools</li>
                    <li>✓ N-Tier architecture is used in 90% of enterprise apps</li>
                    <li>✓ Good setup = easy maintenance & scaling</li>
                </ul>
                `
            },
            {
                id: "tech-stack",
                title: "🛠️ Technology Stack",
                content: `
                <table class="tech-table">
                    <tr>
                        <th>Component</th>
                        <th>Technology</th>
                        <th>Version</th>
                        <th>Purpose</th>
                    </tr>
                    <tr>
                        <td><strong>Framework</strong></td>
                        <td>.NET Core</td>
                        <td>8.0</td>
                        <td>Web application framework</td>
                    </tr>
                    <tr>
                        <td><strong>Web</strong></td>
                        <td>ASP.NET Core</td>
                        <td>8.0</td>
                        <td>HTTP server & routing</td>
                    </tr>
                    <tr>
                        <td><strong>ORM</strong></td>
                        <td>Entity Framework Core</td>
                        <td>8.0.8</td>
                        <td>Database access & mapping</td>
                    </tr>
                    <tr>
                        <td><strong>GraphQL</strong></td>
                        <td>HotChocolate</td>
                        <td>15.1.13</td>
                        <td>Query language API</td>
                    </tr>
                    <tr>
                        <td><strong>Database</strong></td>
                        <td>SQL Server</td>
                        <td>LocalDB</td>
                        <td>Data persistence</td>
                    </tr>
                    <tr>
                        <td><strong>Language</strong></td>
                        <td>C#</td>
                        <td>12.0</td>
                        <td>Programming language</td>
                    </tr>
                </table>

                <h4>💾 Installation</h4>
                <pre><code class="language-bash"># Install .NET 8 SDK
# Download from: https://dotnet.microsoft.com/download

# Verify installation
dotnet --version        # Should show 8.0.x

# Install SQL Server LocalDB
# Download from: https://www.microsoft.com/sql-server/sql-server-express

# Verify SQL Server
# Check Services: "SQL Server (MSSQLSERVER)"
                </code></pre>
                `
            },
            {
                id: "project-structure",
                title: "📂 Project Structure",
                content: `
                <div class="folder-tree">
                    <pre><code class="language-plaintext">ProductCatalogAPI-WebAPI-EFCore/
├── Controllers/                    # API endpoints (HTTP requests)
│   ├── ProductsController.cs       # EF Core REST endpoints
│   └── AdoProductsController.cs    # ADO.NET REST endpoints
│
├── Services/                       # Business logic layer
│   ├── IProductService.cs          # Interface/contract
│   ├── ProductService.cs           # EF Core implementation
│   └── ProductAdoService.cs        # ADO.NET implementation
│
├── Models/                         # Data models
│   └── Product.cs                  # Product entity
│
├── Data/                           # Data access layer
│   ├── ProductDbContext.cs         # EF Core context
│   └── Migrations/                 # Database migrations
│
├── GraphQL/                        # GraphQL schema
│   ├── ProductQuery.cs             # GraphQL queries
│   ├── ProductMutation.cs          # GraphQL mutations
│   └── ProductSubscription.cs      # Real-time updates
│
├── Middleware/                     # HTTP pipeline
│   ├── GlobalErrorHandlingMiddleware.cs
│   ├── RequestLoggingMiddleware.cs
│   └── PerformanceMiddleware.cs
│
├── Program.cs                      # Configuration & startup
├── appsettings.json               # Configuration settings
├── ProductCatalogAPI.csproj       # Project file
└── README.md                       # Documentation
                    </code></pre>
                </div>

                <h4>🎯 Folder Purposes</h4>
                <ul>
                    <li><strong>Controllers:</strong> Handles HTTP requests, validates input, returns responses</li>
                    <li><strong>Services:</strong> Contains business logic, keeps controllers thin</li>
                    <li><strong>Models:</strong> Data structures (database entities & DTOs)</li>
                    <li><strong>Data:</strong> Database access layer (EF DbContext, migrations)</li>
                    <li><strong>GraphQL:</strong> Schema definitions for GraphQL API</li>
                    <li><strong>Middleware:</strong> Custom HTTP pipeline components</li>
                </ul>
                `
            },
            {
                id: "naming-convention",
                title: "📋 Naming Convention",
                content: `
                <h4>Project Naming Pattern</h4>
                <pre><code class="language-plaintext">ProjectName-TechType

Examples:
✓ ProductCatalogAPI-WebAPI-EFCore
✓ ProductCatalogUI-React-JavaScript
✓ ProductCatalogUI-Angular-TypeScript
✓ ProductCatalogUI-MVC-AspNet
✓ ProductCatalogUI-Razor-AspNet

Benefits:
• Clear project name (ProductCatalog)
• Clear technology (React, Angular, MVC)
• Easy to organize multiple projects
• Self-documenting folder structure
                </code></pre>

                <h4>Code Naming Standards</h4>
                <ul>
                    <li><strong>Classes:</strong> PascalCase (ProductService)</li>
                    <li><strong>Methods:</strong> PascalCase (GetProductById)</li>
                    <li><strong>Variables:</strong> camelCase (productId)</li>
                    <li><strong>Constants:</strong> UPPER_CASE (MAX_PRODUCTS)</li>
                    <li><strong>Interfaces:</strong> PascalCase with I prefix (IProductService)</li>
                    <li><strong>Private fields:</strong> _camelCase (_logger)</li>
                </ul>
                `
            }
        ]
    },

    2: {
        title: "💡 Phase 2: Core Concepts",
        timeEstimate: "3-4 hours",
        color: "#764ba2",
        sections: [
            {
                id: "rest-api",
                title: "🌐 REST API Fundamentals",
                content: `
                <h4>What is REST?</h4>
                <p><strong>REST (Representational State Transfer)</strong> is an architectural style for APIs using HTTP methods to perform operations on resources.</p>

                <h4>HTTP Methods</h4>
                <table class="comparison-table">
                    <tr>
                        <th>Method</th>
                        <th>Purpose</th>
                        <th>Safe</th>
                        <th>Idempotent</th>
                        <th>Example</th>
                    </tr>
                    <tr>
                        <td><strong>GET</strong></td>
                        <td>Retrieve data</td>
                        <td>✓ Yes</td>
                        <td>✓ Yes</td>
                        <td>GET /api/products/1</td>
                    </tr>
                    <tr>
                        <td><strong>POST</strong></td>
                        <td>Create new resource</td>
                        <td>✗ No</td>
                        <td>✗ No</td>
                        <td>POST /api/products</td>
                    </tr>
                    <tr>
                        <td><strong>PUT</strong></td>
                        <td>Replace entire resource</td>
                        <td>✗ No</td>
                        <td>✓ Yes</td>
                        <td>PUT /api/products/1</td>
                    </tr>
                    <tr>
                        <td><strong>PATCH</strong></td>
                        <td>Partial update</td>
                        <td>✗ No</td>
                        <td>✗ No</td>
                        <td>PATCH /api/products/1</td>
                    </tr>
                    <tr>
                        <td><strong>DELETE</strong></td>
                        <td>Remove resource</td>
                        <td>✗ No</td>
                        <td>✓ Yes</td>
                        <td>DELETE /api/products/1</td>
                    </tr>
                </table>

                <h4>HTTP Status Codes</h4>
                <ul>
                    <li><strong>2xx (Success):</strong>
                        <ul>
                            <li>200 OK - Request succeeded</li>
                            <li>201 Created - Resource created</li>
                            <li>204 No Content - Success, no response body</li>
                        </ul>
                    </li>
                    <li><strong>4xx (Client Error):</strong>
                        <ul>
                            <li>400 Bad Request - Invalid input</li>
                            <li>401 Unauthorized - Not authenticated</li>
                            <li>403 Forbidden - Access denied</li>
                            <li>404 Not Found - Resource doesn't exist</li>
                        </ul>
                    </li>
                    <li><strong>5xx (Server Error):</strong>
                        <ul>
                            <li>500 Internal Server Error - Unexpected error</li>
                            <li>503 Service Unavailable - Server down</li>
                        </ul>
                    </li>
                </ul>
                `
            },
            {
                id: "n-tier-architecture",
                title: "🏗️ N-Tier Architecture",
                content: `
                <h4>What is N-Tier Architecture?</h4>
                <p>N-Tier separates an application into logical layers, each with specific responsibilities.</p>

                <div class="architecture-diagram">
                    <div class="tier">
                        <div class="tier-name">Presentation Layer</div>
                        <div class="tier-content">Controllers, Views, HTTP Requests</div>
                    </div>
                    <div class="tier-arrow">↓</div>
                    <div class="tier">
                        <div class="tier-name">Business Logic Layer</div>
                        <div class="tier-content">Services, Calculations, Validations</div>
                    </div>
                    <div class="tier-arrow">↓</div>
                    <div class="tier">
                        <div class="tier-name">Data Access Layer</div>
                        <div class="tier-content">DbContext, Repositories, ORM</div>
                    </div>
                    <div class="tier-arrow">↓</div>
                    <div class="tier">
                        <div class="tier-name">Database Layer</div>
                        <div class="tier-content">SQL Server, PostgreSQL, MongoDB</div>
                    </div>
                </div>

                <h4>Benefits of N-Tier</h4>
                <ul>
                    <li>✓ <strong>Separation of Concerns:</strong> Each layer has one responsibility</li>
                    <li>✓ <strong>Testability:</strong> Easy to unit test each layer independently</li>
                    <li>✓ <strong>Maintainability:</strong> Changes in one layer don't affect others</li>
                    <li>✓ <strong>Scalability:</strong> Each tier can scale independently</li>
                    <li>✓ <strong>Reusability:</strong> Services can be reused by multiple controllers</li>
                    <li>✓ <strong>Security:</strong> Validation happens in service layer</li>
                </ul>

                <h4>Typical N-Tier Flow</h4>
                <pre><code class="language-plaintext">Client Request
    ↓
Controller (Validate input)
    ↓
Service (Business logic)
    ↓
DbContext (Database query)
    ↓
Database (Return data)
    ↓
DbContext (Map to entity)
    ↓
Service (Process result)
    ↓
Controller (Format response)
    ↓
Client Response
                </code></pre>
                `
            },
            {
                id: "entity-framework",
                title: "📦 Entity Framework Core Basics",
                content: `
                <h4>What is EF Core?</h4>
                <p><strong>Entity Framework Core</strong> is an Object-Relational Mapper (ORM) that abstracts database operations using C# objects instead of raw SQL.</p>

                <h4>Key Concepts</h4>
                <ul>
                    <li><strong>DbContext:</strong> Main class managing entities and database connections</li>
                    <li><strong>DbSet:</strong> Collection representing a table</li>
                    <li><strong>Entities:</strong> C# classes mapping to database tables</li>
                    <li><strong>LINQ:</strong> Language Integrated Query (type-safe query syntax)</li>
                    <li><strong>Migrations:</strong> Version control for database schema</li>
                </ul>

                <h4>Example: DbContext</h4>
                <pre><code class="language-csharp">public class ProductDbContext : DbContext
{
    public DbSet&lt;Product&gt; Products { get; set; }

    public ProductDbContext(DbContextOptions options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Define table constraints, relationships
        modelBuilder.Entity&lt;Product&gt;()
            .HasKey(p => p.Id);
    }
}
                </code></pre>

                <h4>Example: Query with LINQ</h4>
                <pre><code class="language-csharp">// Instead of SQL: SELECT * FROM Products WHERE Price > 500
var expensiveProducts = await _context.Products
    .Where(p => p.Price > 500)  // Filter
    .OrderBy(p => p.Name)        // Sort
    .ToListAsync();               // Execute (async!)

// Syntactic sugar LINQ
var result = from p in _context.Products
             where p.Price > 500
             orderby p.Name
             select p;
                </code></pre>

                <h4>EF Core Benefits</h4>
                <ul>
                    <li>✓ No manual SQL writing</li>
                    <li>✓ Type-safe queries (compile-time errors)</li>
                    <li>✓ Automatic change tracking</li>
                    <li>✓ Built-in relationship handling</li>
                    <li>✓ Migration system for schema versioning</li>
                </ul>
                `
            }
        ]
    },

    3: {
        title: "⚙️ Phase 3: Implementation",
        timeEstimate: "4-5 hours",
        color: "#f093fb",
        sections: [
            {
                id: "service-pattern",
                title: "💉 Service Layer Pattern",
                content: `
                <h4>What is Service Layer?</h4>
                <p>The service layer contains business logic and acts as an intermediary between controllers and data access layer.</p>

                <h4>Why Services Matter</h4>
                <ul>
                    <li>✓ Controllers stay thin and focused on HTTP</li>
                    <li>✓ Business logic becomes testable and reusable</li>
                    <li>✓ Easy to swap implementations (DI)</li>
                    <li>✓ Caching and optimization happens here</li>
                </ul>

                <h4>Example: Interface & Implementation</h4>
                <pre><code class="language-csharp">// Interface - defines contract
public interface IProductService
{
    Task&lt;List&lt;Product&gt;&gt; GetAllProductsAsync();
    Task&lt;Product?&gt; GetProductByIdAsync(int id);
    Task&lt;Product&gt; CreateProductAsync(Product product);
    Task&lt;bool&gt; DeleteProductAsync(int id);
}

// Implementation - actual logic
public class ProductService : IProductService
{
    private readonly ProductDbContext _context;
    private readonly IMemoryCache _cache;

    public ProductService(ProductDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task&lt;List&lt;Product&gt;&gt; GetAllProductsAsync()
    {
        // Check cache first
        const string cacheKey = "all_products";
        if (_cache.TryGetValue(cacheKey, out List&lt;Product&gt;? cachedProducts))
        {
            return cachedProducts!;
        }

        // Get from database
        var products = await _context.Products
            .Where(p => p.IsActive)
            .ToListAsync();

        // Cache for 5 minutes
        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
        _cache.Set(cacheKey, products, cacheOptions);

        return products;
    }

    public async Task&lt;Product&gt; CreateProductAsync(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // Invalidate cache
        _cache.Remove("all_products");

        return product;
    }
}
                </code></pre>
                `
            },
            {
                id: "dependency-injection",
                title: "🔌 Dependency Injection",
                content: `
                <h4>What is Dependency Injection?</h4>
                <p>DI is a pattern where an object receives its dependencies from external code rather than creating them itself.</p>

                <h4>Without DI (Tightly Coupled)</h4>
                <pre><code class="language-csharp">// ❌ BAD - Hard to test, tightly coupled
public class ProductController
{
    private readonly ProductService _service;

    public ProductController()
    {
        _service = new ProductService(); // Creates own dependency!
    }
}

// Hard to test - can't mock ProductService
                </code></pre>

                <h4>With DI (Loosely Coupled)</h4>
                <pre><code class="language-csharp">// ✅ GOOD - Easy to test, loosely coupled
public interface IProductService
{
    Task&lt;List&lt;Product&gt;&gt; GetAllProductsAsync();
}

public class ProductController
{
    private readonly IProductService _service;

    public ProductController(IProductService service)
    {
        _service = service; // Injected by framework!
    }
}

// Easy to test - can inject mock
var mockService = new Mock&lt;IProductService&gt;();
var controller = new ProductController(mockService.Object);
                </code></pre>

                <h4>ASP.NET Core Dependency Injection</h4>
                <pre><code class="language-csharp">// Program.cs - Register dependencies
builder.Services
    .AddScoped&lt;IProductService, ProductService&gt;()  // Scoped lifetime
    .AddTransient&lt;ILogger, Logger&gt;()                 // Transient lifetime
    .AddSingleton&lt;IConfig, Config&gt;();                // Singleton lifetime

// Lifetimes:
// Transient: New instance every time (lightweight)
// Scoped: One per HTTP request (perfect for DbContext!)
// Singleton: One for entire app lifetime (cache, config)
                </code></pre>

                <h4>Benefits</h4>
                <ul>
                    <li>✓ Easy unit testing (inject mocks)</li>
                    <li>✓ Loose coupling (swap implementations)</li>
                    <li>✓ Cleaner code (framework manages creation)</li>
                    <li>✓ Configuration centralized (Program.cs)</li>
                </ul>
                `
            },
            {
                id: "error-handling",
                title: "🛡️ Error Handling & Middleware",
                content: `
                <h4>Why Error Handling Matters</h4>
                <ul>
                    <li>✓ Users see friendly messages instead of stack traces</li>
                    <li>✓ Sensitive data doesn't leak to clients</li>
                    <li>✓ Errors are logged for debugging</li>
                    <li>✓ Appropriate HTTP status codes returned</li>
                </ul>

                <h4>Global Error Handling Middleware</h4>
                <pre><code class="language-csharp">// Middleware - catches ALL unhandled exceptions
public class GlobalErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger _logger;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Unhandled exception occurred");
            await HandleExceptionAsync(context, exception);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = exception switch
        {
            ArgumentException => new { status = 400, message = "Invalid input" },
            KeyNotFoundException => new { status = 404, message = "Not found" },
            _ => new { status = 500, message = "Server error" }
        };

        context.Response.StatusCode = (int)response.GetType().GetProperty("status").GetValue(response);
        return context.Response.WriteAsJsonAsync(response);
    }
}

// Register in Program.cs
app.UseMiddleware&lt;GlobalErrorHandlingMiddleware&gt;();
                </code></pre>

                <h4>Try-Catch in Controllers</h4>
                <pre><code class="language-csharp">public async Task&lt;ActionResult&lt;Product&gt;&gt; GetProduct(int id)
{
    try
    {
        if (id &lt;= 0)
            return BadRequest(new { error = "Invalid ID" });

        var product = await _service.GetProductByIdAsync(id);

        if (product == null)
            return NotFound(new { error = "Product not found" });

        return Ok(product);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error in GetProduct");
        return StatusCode(500, new { error = "Internal server error" });
    }
}
                </code></pre>
                `
            }
        ]
    },

    4: {
        title: "🚀 Phase 4: Advanced Patterns",
        timeEstimate: "3-4 hours",
        color: "#4facfe",
        sections: [
            {
                id: "caching-intro",
                title: "⚡ Caching 5 Strategies",
                content: `
                <h4>Why Caching?</h4>
                <ul>
                    <li>✓ Reduce database load dramatically</li>
                    <li>✓ Faster response times (100x!)</li>
                    <li>✓ Improve user experience</li>
                    <li>✓ Cost savings (less infrastructure)</li>
                </ul>

                <h4>Strategy 1: In-Memory Cache</h4>
                <p><strong>Speed:</strong> ⚡⚡⚡ (1ms) | <strong>Persistence:</strong> App restarts lose data</p>
                <pre><code class="language-csharp">// Registration
builder.Services.AddMemoryCache();

// Usage
public class ProductService
{
    private readonly IMemoryCache _cache;

    public ProductService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public async Task&lt;List&lt;Product&gt;&gt; GetProductsAsync()
    {
        if (_cache.TryGetValue("products", out List&lt;Product&gt; cached))
            return cached; // Cache HIT!

        var products = await _context.Products.ToListAsync();

        _cache.Set("products", products, TimeSpan.FromMinutes(5));
        return products; // Cache MISS
    }
}
                </code></pre>

                <h4>Strategy 2: HTTP Cache Headers</h4>
                <p><strong>Speed:</strong> ⚡⚡⚡ (0ms - browser) | <strong>Persistence:</strong> Browser only</p>
                <pre><code class="language-csharp">// On GET endpoints
[ResponseCache(Duration = 300)] // 5 minutes
public async Task&lt;ActionResult&lt;List&lt;Product&gt;&gt;&gt; GetProducts()

// On mutation endpoints (no caching)
[ResponseCache(NoStore = true)]
public async Task&lt;ActionResult&lt;Product&gt;&gt; CreateProduct()
                </code></pre>

                <h4>Strategy 3: Distributed Cache (Redis)</h4>
                <p><strong>Speed:</strong> ⚡⚡ (10-50ms) | <strong>Persistence:</strong> Across servers</p>
                <pre><code class="language-csharp">// Register Redis
builder.Services.AddStackExchangeRedisCache(opts =>
{
    opts.Configuration = "localhost:6379";
});

// Usage
public class ProductService
{
    private readonly IDistributedCache _cache;

    public async Task&lt;List&lt;Product&gt;&gt; GetProductsAsync()
    {
        var cached = await _cache.GetStringAsync("products");
        if (cached != null)
            return JsonConvert.DeserializeObject&lt;List&lt;Product&gt;&gt;(cached);

        var products = await _context.Products.ToListAsync();

        await _cache.SetStringAsync("products",
            JsonConvert.SerializeObject(products),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            });

        return products;
    }
}
                </code></pre>

                <h4>Strategy 4: Query Compilation</h4>
                <p><strong>Speed:</strong> ⚡⚡ (50-100ms) | <strong>Persistence:</strong> Built-in EF Core</p>
                <pre><code class="language-csharp">// EF Core automatically caches compiled queries
// First run: 150ms
// Subsequent runs: 50ms (compiled query reused!)

// To see difference:
var products1 = await _context.Products.ToListAsync(); // 150ms
var products2 = await _context.Products.ToListAsync(); // 50ms (cached!)
                </code></pre>

                <h4>Strategy 5: Middleware Caching</h4>
                <p><strong>Speed:</strong> ⚡⚡⚡ (1ms) | <strong>Persistence:</strong> App restarts lose data</p>
                <pre><code class="language-csharp">// Program.cs
builder.Services.AddResponseCaching();
app.UseResponseCaching();

// Respects [ResponseCache] attributes
                </code></pre>

                <h4>Performance Improvement</h4>
                <pre><code class="language-plaintext">Without caching:    100 requests = 15 seconds (100 × 150ms)
With in-memory:     100 requests = 150ms (1 × 150ms + 99 × 1ms)
Improvement:        100x FASTER! ⚡

Database queries:   100 → 1 (99% reduction!)
                </code></pre>
                `
            },
            {
                id: "middleware-pipeline",
                title: "🔄 Middleware Pipeline",
                content: `
                <h4>What is Middleware?</h4>
                <p>Middleware components run in sequence, processing HTTP requests and responses. Each middleware can pass control to the next or short-circuit.</p>

                <h4>Typical Middleware Order</h4>
                <pre><code class="language-plaintext">Request →
  GlobalErrorHandlingMiddleware (catch errors from all below)
    ↓
  RequestLoggingMiddleware (log request)
    ↓
  PerformanceMiddleware (measure time)
    ↓
  ResponseCachingMiddleware (handle cache)
    ↓
  CORSMiddleware (cross-origin)
    ↓
  Controllers/Endpoints (actual endpoint)
    ↓
Response ←
                </code></pre>

                <h4>Building Custom Middleware</h4>
                <pre><code class="language-csharp">// Performance middleware example
public class PerformanceMiddleware
{
    private readonly RequestDelegate _next;

    public PerformanceMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        await _next(context); // Call next middleware
        stopwatch.Stop();

        context.Response.Headers.Add("X-Response-Time",
            stopwatch.ElapsedMilliseconds + "ms");
    }
}

// Register in Program.cs
app.UseMiddleware&lt;PerformanceMiddleware&gt;();
                </code></pre>

                <h4>Key Principles</h4>
                <ul>
                    <li>✓ Order matters - first registered runs first on request</li>
                    <li>✓ Error handling middleware should be early</li>
                    <li>✓ Each middleware calls _next() to continue chain</li>
                    <li>✓ Middleware runs in reverse order on response</li>
                    <li>✓ Can short-circuit by not calling _next()</li>
                </ul>
                `
            }
        ]
    },

    5: {
        title: "📊 Phase 5: Operations",
        timeEstimate: "2-3 hours",
        color: "#f5576c",
        sections: [
            {
                id: "logging",
                title: "📝 Logging & Monitoring",
                content: `
                <h4>Why Logging?</h4>
                <ul>
                    <li>✓ Debug issues in production</li>
                    <li>✓ Track user actions</li>
                    <li>✓ Monitor performance</li>
                    <li>✓ Detect security issues</li>
                </ul>

                <h4>Built-in Logging</h4>
                <pre><code class="language-csharp">// Register logging
builder.Services.AddLogging();

// Use in service
public class ProductService
{
    private readonly ILogger&lt;ProductService&gt; _logger;

    public ProductService(ILogger&lt;ProductService&gt; logger)
    {
        _logger = logger;
    }

    public async Task&lt;List&lt;Product&gt;&gt; GetProductsAsync()
    {
        _logger.LogInformation("Fetching all products");

        try
        {
            var products = await _context.Products.ToListAsync();
            _logger.LogInformation("Retrieved {Count} products", products.Count);
            return products;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching products");
            throw;
        }
    }
}
                </code></pre>

                <h4>Log Levels</h4>
                <ul>
                    <li><strong>Trace:</strong> Very detailed diagnostic info</li>
                    <li><strong>Debug:</strong> Development debugging</li>
                    <li><strong>Information:</strong> General informational messages</li>
                    <li><strong>Warning:</strong> Potentially problematic situations</li>
                    <li><strong>Error:</strong> Error events</li>
                    <li><strong>Critical:</strong> Very serious errors</li>
                </ul>

                <h4>Log Storage Locations</h4>
                <ul>
                    <li><strong>Console:</strong> Development - directly in terminal</li>
                    <li><strong>File:</strong> Serilog library (appsettings.json)</li>
                    <li><strong>Cloud:</strong> Azure Application Insights, AWS CloudWatch</li>
                    <li><strong>Aggregators:</strong> ELK Stack, Splunk, DataDog</li>
                </ul>
                `
            },
            {
                id: "deployment",
                title: "🚀 Deployment",
                content: `
                <h4>Deployment Options</h4>
                <ul>
                    <li><strong>Local Machine:</strong> dotnet run</li>
                    <li><strong>On-Premises Server:</strong> Windows Server IIS</li>
                    <li><strong>Docker Container:</strong> Self-managed</li>
                    <li><strong>Cloud:</strong> Azure App Service, AWS EC2, Heroku</li>
                </ul>

                <h4>Basic Deployment Steps</h4>
                <pre><code class="language-bash"># 1. Build for production
dotnet publish -c Release

# 2. Create Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
COPY --from=build /app/publish /app
WORKDIR /app
EXPOSE 80
ENTRYPOINT ["dotnet", "ProductCatalogAPI.dll"]

# 3. Build Docker image
docker build -t productcatalog .

# 4. Run container
docker run -p 80:80 productcatalog

# 5. Push to registry (optional)
docker tag productcatalog myregistry/productcatalog:1.0
docker push myregistry/productcatalog:1.0
                </code></pre>

                <h4>Environment Variables</h4>
                <pre><code class="language-csharp">// appsettings.json (development)
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\\\mssqllocaldb;..."
  }
}

// appsettings.Production.json (production)
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-server.database.windows.net;..."
  }
}

// Code (automatic switching based on environment)
var connString = builder.Configuration.GetConnectionString("DefaultConnection");
                </code></pre>
                `
            }
        ]
    },

    6: {
        title: "🎓 Phase 6: Interview Prep",
        timeEstimate: "2-3 hours",
        color: "#f093fb",
        sections: [
            {
                id: "key-concepts",
                title: "🎯 6 Key Concepts",
                content: `
                <h4>1. N-Tier Architecture</h4>
                <p><strong>What:</strong> Separates app into logical layers (Presentation, Business, Data)</p>
                <p><strong>Why:</strong> Separation of concerns, testability, maintainability</p>
                <p><strong>Answer:</strong> "N-Tier separates my app into Controllers (HTTP), Services (logic), and Data Access (database). Each layer has one job, making testing easy and changes isolated."</p>

                <h4>2. Dependency Injection</h4>
                <p><strong>What:</strong> Framework provides dependencies instead of creating them</p>
                <p><strong>Why:</strong> Loose coupling, easy testing, cleaner code</p>
                <p><strong>Answer:</strong> "Services are registered in Program.cs and injected into constructors. This lets me mock dependencies in tests and swap implementations easily."</p>

                <h4>3. Async/Await</h4>
                <p><strong>What:</strong> Non-blocking code execution</p>
                <p><strong>Why:</strong> Scalability - threads can handle other requests while waiting</p>
                <p><strong>Answer:</strong> "Async/await releases threads while waiting for I/O. With 10 requests, I don't need 10 threads - same thread handles all while they wait. 100x more scalable!"</p>

                <h4>4. Soft Delete Pattern</h4>
                <p><strong>What:</strong> Mark records inactive instead of deleting</p>
                <p><strong>Why:</strong> Preserve history, recover data, maintain relationships</p>
                <p><strong>Answer:</strong> "Soft delete sets IsActive=false instead of hard deleting. Keeps audit history, allows recovery, and maintains referential integrity."</p>

                <h4>5. Caching Strategies</h4>
                <p><strong>What:</strong> Store frequently accessed data to avoid expensive lookups</p>
                <p><strong>Why:</strong> 100x faster response times</p>
                <p><strong>Answer:</strong> "In-memory for single server (fast), Redis for multiple servers (distributed), HTTP headers for browser caching. Cache invalidation on updates."</p>

                <h4>6. Middleware Pipeline</h4>
                <p><strong>What:</strong> Request → Middleware chain → Response</p>
                <p><strong>Why:</strong> Cross-cutting concerns (logging, error handling, CORS)</p>
                <p><strong>Answer:</strong> "Middleware run in order on request, reverse on response. Error middleware first, then logging, CORS, finally endpoints."</p>
                `
            },
            {
                id: "common-questions",
                title: "❓ Common Interview Questions",
                content: `
                <h4>Q1: Explain N-Tier Architecture</h4>
                <p><strong>Answer Structure:</strong></p>
                <ul>
                    <li>What: Separates app into logical layers</li>
                    <li>Layers: Presentation (UI) → Business Logic (Services) → Data Access (DbContext) → Database</li>
                    <li>Benefits: Testability, maintainability, scalability</li>
                    <li>Example: Controllers call services, services call DbContext, DbContext queries database</li>
                </ul>

                <h4>Q2: What's the difference between REST and GraphQL?</h4>
                <p><strong>Answer:</strong></p>
                <ul>
                    <li>REST: Multiple endpoints, fixed response format (over/under-fetching)</li>
                    <li>GraphQL: One endpoint, client specifies needed fields (no over/under-fetching)</li>
                    <li>Use REST: Simple CRUD APIs</li>
                    <li>Use GraphQL: Multiple clients with varying needs</li>
                </ul>

                <h4>Q3: When would you use EF Core vs ADO.NET?</h4>
                <p><strong>Answer:</strong></p>
                <ul>
                    <li>EF Core: Standard CRUD, rapid development, LINQ safety</li>
                    <li>ADO.NET: Complex queries, performance-critical, stored procedures</li>
                    <li>GraphQL: Flexible client queries, multiple frontend types</li>
                </ul>

                <h4>Q4: How do you handle errors in ASP.NET?</h4>
                <p><strong>Answer:</strong></p>
                <ul>
                    <li>Global middleware for unhandled exceptions</li>
                    <li>Try-catch in services for expected errors</li>
                    <li>Log errors for debugging</li>
                    <li>Return appropriate HTTP status codes</li>
                    <li>Never expose stack traces to client</li>
                </ul>

                <h4>Q5: What is Dependency Injection?</h4>
                <p><strong>Answer:</strong></p>
                <ul>
                    <li>Framework provides dependencies via constructor</li>
                    <li>Reduces coupling between classes</li>
                    <li>Makes testing easy (inject mocks)</li>
                    <li>Register in Program.cs: builder.Services.AddScoped&lt;IService, Service&gt;()</li>
                </ul>

                <h4>Q6: How do you optimize a slow API?</h4>
                <p><strong>Answer:</strong></p>
                <ul>
                    <li>Profile to find bottleneck (database, network, logic?)</li>
                    <li>Add caching (in-memory, Redis, HTTP headers)</li>
                    <li>Optimize queries (indexes, eager loading)</li>
                    <li>Use async/await</li>
                    <li>Consider ADO.NET for complex queries</li>
                </ul>
                `
            }
        ]
    },

    7: {
        title: "⚡ Phase 7: Quick Reference",
        timeEstimate: "On-demand",
        color: "#fa709a",
        sections: [
            {
                id: "commands",
                title: "💻 Essential Commands",
                content: `
                <h4>Project Setup</h4>
                <pre><code class="language-bash"># Create new project
dotnet new webapi -n ProjectName

# List project structure
dotnet sln list

# Build
dotnet build

# Run
dotnet run

# Clean
dotnet clean
                </code></pre>

                <h4>Database & EF Core</h4>
                <pre><code class="language-bash"># Create migration
dotnet ef migrations add InitialCreate

# List migrations
dotnet ef migrations list

# Update database
dotnet ef database update

# Remove last migration
dotnet ef migrations remove

# Create DbContext script
dotnet ef dbcontext scaffold
                </code></pre>

                <h4>Testing</h4>
                <pre><code class="language-bash"># Run tests
dotnet test

# Run specific test
dotnet test --filter "MethodName"

# Show verbose output
dotnet test --verbosity detailed
                </code></pre>

                <h4>NuGet Packages</h4>
                <pre><code class="language-bash"># Add package
dotnet add package PackageName

# Remove package
dotnet remove package PackageName

# Update package
dotnet package update PackageName

# List packages
dotnet package search
                </code></pre>
                `
            },
            {
                id: "code-snippets",
                title: "📋 Common Code Patterns",
                content: `
                <h4>Create DbContext</h4>
                <pre><code class="language-csharp">public class AppDbContext : DbContext
{
    public DbSet&lt;Product&gt; Products { get; set; }

    public AppDbContext(DbContextOptions options) : base(options) { }
}
                </code></pre>

                <h4>Register DI</h4>
                <pre><code class="language-csharp">// Program.cs
builder.Services.AddDbContext&lt;AppDbContext&gt;(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddScoped&lt;IProductService, ProductService&gt;();
                </code></pre>

                <h4>Try-Catch Pattern</h4>
                <pre><code class="language-csharp">try
{
    var result = await _service.GetAsync(id);
    return Ok(result);
}
catch (KeyNotFoundException)
{
    return NotFound();
}
catch (Exception ex)
{
    _logger.LogError(ex, "Error");
    return StatusCode(500);
}
                </code></pre>

                <h4>Async Service</h4>
                <pre><code class="language-csharp">public async Task&lt;List&lt;T&gt;&gt; GetAllAsync()
{
    return await _context.Set&lt;T&gt;()
        .Where(x => x.IsActive)
        .ToListAsync();
}
                </code></pre>
                `
            },
            {
                id: "troubleshooting",
                title: "🔧 Common Issues & Fixes",
                content: `
                <h4>Issue: "DbContext not registered"</h4>
                <p><strong>Solution:</strong> Add to Program.cs:</p>
                <pre><code class="language-csharp">builder.Services.AddDbContext&lt;YourDbContext&gt;(options =>
    options.UseSqlServer(connectionString));
                </code></pre>

                <h4>Issue: "Cannot resolve service"</h4>
                <p><strong>Solution:</strong> Service not registered. Check Program.cs have AddScoped/AddTransient/AddSingleton</p>

                <h4>Issue: "Connection string error"</h4>
                <p><strong>Solution:</strong> Check appsettings.json has correct ConnectionStrings</p>

                <h4>Issue: "N+1 query problem"</h4>
                <p><strong>Solution:</strong> Use .Include() for related data:</p>
                <pre><code class="language-csharp">var products = await _context.Products
    .Include(p => p.Category)  // Load related data
    .ToListAsync();
                </code></pre>

                <h4>Issue: "Migration conflicts"</h4>
                <p><strong>Solution:</strong> Remove pending migrations and recreate</p>
                <pre><code class="language-bash">dotnet ef migrations remove
dotnet ef migrations add MyMigration
dotnet ef database update
                </code></pre>
                `
            }
        ]
    },

    8: {
        title: "🔄 Phase 8: Data Access Approaches",
        timeEstimate: "2-3 hours",
        color: "#00f2fe",
        sections: [
            {
                id: "ef-core",
                title: "EF Core - ORM Approach",
                content: `
                <h4>Performance: ⭐⭐⭐ (150ms)</h4>
                <p><strong>Developer Experience:</strong> Excellent (LINQ + auto-mapping)</p>

                <h4>Advantages</h4>
                <ul>
                    <li>✓ No SQL writing (LINQ)</li>
                    <li>✓ Type-safe queries</li>
                    <li>✓ Automatic change tracking</li>
                    <li>✓ Built-in migrations</li>
                    <li>✓ Relationships handled</li>
                </ul>

                <h4>Example: Get Products</h4>
                <pre><code class="language-csharp">public async Task&lt;List&lt;Product&gt;&gt; GetProductsAsync()
{
    return await _context.Products
        .Where(p => p.IsActive)
        .OrderBy(p => p.Name)
        .ToListAsync();
}
                </code></pre>

                <h4>When to Use</h4>
                <ul>
                    <li>✓ Standard CRUD operations</li>
                    <li>✓ Rapid development needed</li>
                    <li>✓ Performance is acceptable</li>
                    <li>✓ Team knows LINQ</li>
                </ul>
                `
            },
            {
                id: "adonet",
                title: "ADO.NET - Raw SQL Approach",
                content: `
                <h4>Performance: ⭐⭐⭐⭐⭐ (50ms) - FASTEST!</h4>
                <p><strong>Developer Experience:</strong> Tedious (manual mapping)</p>

                <h4>Advantages</h4>
                <ul>
                    <li>✓ Maximum performance</li>
                    <li>✓ Full SQL control</li>
                    <li>✓ Stored procedures</li>
                    <li>✓ Complex queries optimized</li>
                </ul>

                <h4>Example: Get Products</h4>
                <pre><code class="language-csharp">public async Task&lt;List&lt;Product&gt;&gt; GetProductsAsync()
{
    using (var connection = new SqlConnection(_connectionString))
    {
        await connection.OpenAsync();

        var command = connection.CreateCommand();
        command.CommandText = "SELECT Id, Name, Price FROM Products WHERE IsActive = 1";

        using (var reader = await command.ExecuteReaderAsync())
        {
            var products = new List&lt;Product&gt;();
            while (await reader.ReadAsync())
            {
                products.Add(new Product
                {
                    Id = reader.GetInt32(0),
                    Name = reader.GetString(1),
                    Price = reader.GetDecimal(2)
                });
            }
            return products;
        }
    }
}
                </code></pre>

                <h4>When to Use</h4>
                <ul>
                    <li>✓ Maximum performance critical</li>
                    <li>✓ Complex reporting queries</li>
                    <li>✓ Using stored procedures</li>
                    <li>✓ Profiling shows SQL is bottleneck</li>
                </ul>
                `
            },
            {
                id: "graphql",
                title: "GraphQL - Query Language",
                content: `
                <h4>Performance: ⭐⭐⭐ (80ms)</h4>
                <p><strong>Developer Experience:</strong> Excellent (query exactly what needed)</p>

                <h4>Key Advantages</h4>
                <ul>
                    <li>✓ No over-fetching (clients request exact fields)</li>
                    <li>✓ No under-fetching (one query for related data)</li>
                    <li>✓ 6x smaller responses</li>
                    <li>✓ Self-documenting schema</li>
                </ul>

                <h4>Example: Get Products</h4>
                <pre><code class="language-graphql">query {
  products {
    id
    name
    price
  }
}
                </code></pre>

                <h4>Bandwidth Comparison</h4>
                <pre><code class="language-plaintext">REST API:     Returns ALL fields (300 bytes) - wasteful
GraphQL:      Returns ONLY requested fields (50 bytes) - efficient
Savings:      6x smaller response! ✓
                </code></pre>

                <h4>When to Use</h4>
                <ul>
                    <li>✓ Multiple client types (web, mobile, desktop)</li>
                    <li>✓ Varying data requirements</li>
                    <li>✓ Mobile apps (bandwidth critical)</li>
                    <li>✓ Complex nested relationships</li>
                </ul>
                `
            },
            {
                id: "comparison-table",
                title: "📊 Quick Comparison",
                content: `
                <table class="comparison-table">
                    <tr>
                        <th>Aspect</th>
                        <th>EF Core</th>
                        <th>ADO.NET</th>
                        <th>GraphQL</th>
                    </tr>
                    <tr>
                        <td><strong>Speed</strong></td>
                        <td>150ms ⭐⭐⭐</td>
                        <td>50ms ⭐⭐⭐⭐⭐</td>
                        <td>80ms ⭐⭐⭐</td>
                    </tr>
                    <tr>
                        <td><strong>DX</strong></td>
                        <td>Excellent ✓</td>
                        <td>Tedious ✗</td>
                        <td>Excellent ✓</td>
                    </tr>
                    <tr>
                        <td><strong>Bandwidth</strong></td>
                        <td>300 bytes</td>
                        <td>300 bytes</td>
                        <td>50 bytes ✓✓✓</td>
                    </tr>
                    <tr>
                        <td><strong>Endpoints</strong></td>
                        <td>Multiple</td>
                        <td>Multiple</td>
                        <td>Single</td>
                    </tr>
                    <tr>
                        <td><strong>Learning</strong></td>
                        <td>Moderate</td>
                        <td>Moderate</td>
                        <td>Learning curve</td>
                    </tr>
                    <tr>
                        <td><strong>Best For</strong></td>
                        <td>CRUD APIs</td>
                        <td>Complex reports</td>
                        <td>Modern frontends</td>
                    </tr>
                </table>
                `
            }
        ]
    },

    9: {
        title: "📡 Phase 9: GraphQL & HotChocolate",
        timeEstimate: "3-4 hours",
        color: "#667eea",
        sections: [
            {
                id: "graphql-basics",
                title: "GraphQL Fundamentals",
                content: `
                <h4>What is GraphQL?</h4>
                <p><strong>GraphQL = Query Language for APIs</strong></p>
                <ul>
                    <li>Clients request EXACT data needed</li>
                    <li>No over-fetching (unnecessary fields)</li>
                    <li>No under-fetching (related data in one query)</li>
                    <li>Self-documenting schema</li>
                </ul>

                <h4>REST vs GraphQL Example</h4>
                <pre><code class="language-plaintext">REST API:
GET /api/products/1
Response: {ALL fields}
{id, name, description, price, stock, category, ...}

GraphQL:
query { productById(id: 1) { name price } }
Response: {ONLY requested fields}
{name, price}
                </code></pre>

                <h4>GraphQL Concepts</h4>
                <ul>
                    <li><strong>Query:</strong> Read data (like GET)</li>
                    <li><strong>Mutation:</strong> Write data (like POST/PUT/DELETE)</li>
                    <li><strong>Subscription:</strong> Real-time updates (WebSocket)</li>
                    <li><strong>Schema:</strong> Type definitions (self-documenting)</li>
                    <li><strong>Resolver:</strong> Function that fetches field value</li>
                </ul>
                `
            },
            {
                id: "hotchocolate-setup",
                title: "HotChocolate Setup",
                content: `
                <h4>Installation</h4>
                <pre><code class="language-bash">dotnet add package HotChocolate.AspNetCore
dotnet add package HotChocolate.Types
                </code></pre>

                <h4>Configuration</h4>
                <pre><code class="language-csharp">// Program.cs
builder.Services
    .AddGraphQLServer()
    .AddQueryType&lt;ProductQuery&gt;()
    .AddMutationType&lt;ProductMutation&gt;();

// Add to pipeline
app.MapGraphQL("/graphql");
                </code></pre>

                <h4>Create Query Type</h4>
                <pre><code class="language-csharp">public class ProductQuery
{
    public async Task&lt;List&lt;Product&gt;&gt; GetProducts(
        [Service] IProductService service)
    {
        return await service.GetAllProductsAsync();
    }

    public async Task&lt;Product?&gt; GetProductById(
        int id,
        [Service] IProductService service)
    {
        return await service.GetProductByIdAsync(id);
    }
}
                </code></pre>

                <h4>Access Playground</h4>
                <pre><code class="language-plaintext">Open in browser:
http://localhost:5000/graphql

Features:
✓ Query editor
✓ Built-in documentation
✓ Schema explorer
✓ Query history
✓ Real-time execution
                </code></pre>
                `
            },
            {
                id: "graphql-testing",
                title: "Testing GraphQL",
                content: `
                <h4>Method 1: Banana Cake Pop (Built-in)</h4>
                <pre><code class="language-graphql">query {
  products {
    id
    name
    price
  }
}
                </code></pre>

                <h4>Method 2: REST Client (.http file)</h4>
                <pre><code class="language-http">POST http://localhost:5000/graphql
Content-Type: application/json

{
  "query": "{ products { id name price } }"
}
                </code></pre>

                <h4>Method 3: curl Command</h4>
                <pre><code class="language-bash">curl -X POST http://localhost:5000/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query":"{ products { id name price } }"}'
                </code></pre>

                <h4>Method 4: Unit Tests</h4>
                <pre><code class="language-csharp">[Fact]
public async Task GetProducts_ReturnsAllProducts()
{
    var query = "{ products { id name } }";

    var result = await _schema.ExecuteAsync(query);

    Assert.Null(result.Errors);
    Assert.NotNull(result.Data);
}
                </code></pre>

                <h4>Testing Q&A</h4>
                <pre><code class="language-graphql">query {
  productById(id: 1) {
    name
    price
  }
}

mutation {
  createProduct(input: {
    name: "Laptop"
    price: 999.99
    stockQuantity: 10
    category: "Electronics"
  }) {
    id
    name
  }
}
                </code></pre>
                `
            },
            {
                id: "apollo-federation",
                title: "Apollo Federation (Advanced)",
                content: `
                <h4>What is Apollo Federation?</h4>
                <p>Combine multiple GraphQL services into one unified schema</p>

                <h4>Use Case</h4>
                <pre><code class="language-plaintext">Service 1: Products API
Service 2: Users API
Service 3: Orders API

Apollo Gateway: Combines all 3 into single schema!

Client can query across all services in one request.
                </code></pre>

                <h4>Benefits</h4>
                <ul>
                    <li>✓ Microservices with GraphQL</li>
                    <li>✓ Each team owns their service</li>
                    <li>✓ Unified schema for clients</li>
                    <li>✓ Independent deployment</li>
                </ul>

                <h4>Example Federation Query</h4>
                <pre><code class="language-graphql">query {
  userById(id: 1) {
    name
    email
    orders {          # Comes from Orders Service
      id
      total
      products {     # Comes from Products Service
        name
        price
      }
    }
  }
}
                </code></pre>
                `
            }
        ]
    },

    10: {
        title: "⚙️ Phase 10: Advanced Querying & Collections",
        timeEstimate: "4-5 hours",
        color: "#FF6B6B",
        sections: [
            {
                id: "collections-overview",
                title: "C# Collections: List, IEnumerable, IQueryable",
                content: `
                <h4>Collection Types Comparison</h4>
                <table class="comparison-table">
                    <tr>
                        <th>Type</th>
                        <th>Use Case</th>
                        <th>Performance</th>
                        <th>When to Use</th>
                    </tr>
                    <tr>
                        <td><strong>List&lt;T&gt;</strong></td>
                        <td>Resizable, indexed collection</td>
                        <td>O(1) access, O(n) remove</td>
                        <td>Storing/caching data</td>
                    </tr>
                    <tr>
                        <td><strong>IEnumerable&lt;T&gt;</strong></td>
                        <td>Abstract interface</td>
                        <td>Varies by implementation</td>
                        <td>Return types, flexibility</td>
                    </tr>
                    <tr>
                        <td><strong>IQueryable&lt;T&gt;</strong></td>
                        <td>Database queries</td>
                        <td>Filtered at database</td>
                        <td>EF Core queries</td>
                    </tr>
                    <tr>
                        <td><strong>HashSet&lt;T&gt;</strong></td>
                        <td>Unique items</td>
                        <td>O(1) lookup</td>
                        <td>Deduplication</td>
                    </tr>
                    <tr>
                        <td><strong>Dictionary&lt;K,V&gt;</strong></td>
                        <td>Key-value pairs</td>
                        <td>O(1) by key</td>
                        <td>Fast lookups</td>
                    </tr>
                </table>

                <h4>From ProductCatalogAPI:</h4>
                <pre><code class="language-csharp">// List&lt;T&gt; - Standard return type
public async Task&lt;List&lt;Product&gt;&gt; GetAllProductsAsync()
{
    var products = await _context.Products
        .Where(p => p.IsActive)
        .OrderBy(p => p.Name)
        .AsNoTracking()
        .ToListAsync();  // IQueryable → List&lt;Product&gt;

    return products;  // Stored in memory and cache
}

// IEnumerable&lt;T&gt; - API return abstraction
public async Task&lt;ActionResult&lt;IEnumerable&lt;Product&gt;&gt;&gt; GetAllProducts()
{
    var products = await _productService.GetAllProductsAsync();
    return Ok(products);  // List presented as IEnumerable
}

// IQueryable&lt;T&gt; - Deferred execution
var query = _context.Products
    .Where(p => p.IsActive)      // Still IQueryable
    .OrderBy(p => p.Name)        // Still IQueryable
    .AsNoTracking();             // Still IQueryable
var results = await query.ToListAsync();  // NOW executes
                </code></pre>

                <h4>Key Concepts</h4>
                <ul>
                    <li><strong>List&lt;T&gt;:</strong> Concrete collection type, resizable, indexed access</li>
                    <li><strong>IEnumerable&lt;T&gt;:</strong> Interface for any iterable collection, used in APIs</li>
                    <li><strong>IQueryable&lt;T&gt;:</strong> Deferred execution, builds SQL query before executing</li>
                    <li><strong>AsNoTracking():</strong> Disables change tracking, ~30% faster on reads</li>
                    <li><strong>ToListAsync():</strong> Materializes query into List&lt;T&gt;</li>
                </ul>
                `
            },
            {
                id: "linq-patterns",
                title: "LINQ Joins & Advanced Filtering",
                content: `
                <h4>WHERE Filtering Patterns</h4>
                <pre><code class="language-csharp">// Single condition
.Where(p => p.IsActive)
// WHERE IsActive = 1

// Multiple AND conditions
.Where(p => p.Category == category && p.IsActive)
// WHERE Category = @Category AND IsActive = 1

// OR conditions
.Where(p => p.Category == "Electronics" || p.Category == "Computers")
// WHERE Category IN (...)

// Range conditions
.Where(p => p.Price >= 100 && p.Price <= 1000)
// WHERE Price BETWEEN 100 AND 1000

// String operations
.Where(p => p.Name.Contains("Pro"))
// WHERE Name LIKE '%Pro%'
                </code></pre>

                <h4>Sorting & Ordering</h4>
                <pre><code class="language-csharp">// Single sort
.OrderBy(p => p.Name)
// ORDER BY Name ASC

// Descending
.OrderByDescending(p => p.Price)
// ORDER BY Price DESC

// Multiple sorts
.OrderBy(p => p.Category)
    .ThenByDescending(p => p.Price)
// ORDER BY Category ASC, Price DESC

// Used in your code:
var products = await _context.Products
    .Where(p => p.Category == category && p.IsActive)
    .OrderBy(p => p.Name)        // Sort at database
    .AsNoTracking()
    .ToListAsync();
                </code></pre>

                <h4>JOIN Patterns (Conceptual)</h4>
                <p><strong>Note:</strong> Your code uses Category as string, not separate table. Here are patterns for related entities:</p>
                <pre><code class="language-csharp">// INNER JOIN - Only matching records
var result = await (from product in _context.Products
                    join category in _context.Categories
                    on product.CategoryId equals category.Id
                    select new { product.Name, category.Name })
    .ToListAsync();

// LEFT JOIN - All products, even if category doesn't exist
var result = await _context.Products
    .GroupJoin(
        _context.Categories,
        p => p.CategoryId,
        c => c.Id,
        (p, categories) => new
        {
            p.Name,
            CategoryName = categories.FirstOrDefault()?.Name ?? "Uncategorized"
        }
    )
    .ToListAsync();
                </code></pre>

                <h4>Performance Optimization</h4>
                <ul>
                    <li>Filter at database with WHERE (reduce network traffic)</li>
                    <li>Sort at database with ORDER BY (database has indexes)</li>
                    <li>Project early with SELECT (fewer columns transferred)</li>
                    <li>Use AsNoTracking() for read-only queries</li>
                    <li>Build queries as IQueryable, execute last</li>
                </ul>
                `
            },
            {
                id: "ef-core-approaches",
                title: "EF Core: Code First vs Database First",
                content: `
                <h3>EF Core Development Approaches</h3>

                <h4>1. Code First Approach (✅ ProductCatalogAPI Uses This)</h4>
                <p><strong>Overview:</strong> Define C# models first, generate database schema from them using migrations.</p>

                <h5>Step 1: Define Model</h5>
                <pre><code class="language-csharp">// Models/Product.cs
public class Product
{
    public int Id { get; set; }              // Primary Key
    public string Name { get; set; }         // → nvarchar(100)
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string Category { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
    public bool IsActive { get; set; }       // Soft delete flag
}
                </code></pre>

                <h5>Step 2: Define DbContext</h5>
                <pre><code class="language-csharp">// Data/ProductDbContext.cs
public class ProductDbContext : DbContext
{
    public ProductDbContext(DbContextOptions&lt;ProductDbContext&gt; options)
        : base(options) { }

    public DbSet&lt;Product&gt; Products { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity&lt;Product&gt;(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(100);
            entity.HasIndex(p => p.Category);
        });
    }
}
                </code></pre>

                <h5>Step 3-4: Create Migration & Apply</h5>
                <pre><code class="language-bash"># Generate SQL from C# models
dotnet ef migrations add InitialCreate

# Apply to database
dotnet ef database update

# Result: Products table created with all columns!
                </code></pre>

                <h4>Code First Workflow</h4>
                <pre><code>Define C# Models → DbContext → Create Migration → Database Update</code></pre>

                <table class="comparison-table">
                    <tr>
                        <th>Aspect</th>
                        <th>Code First</th>
                    </tr>
                    <tr>
                        <td>Source of Truth</td>
                        <td>C# Models</td>
                    </tr>
                    <tr>
                        <td>SchemaVersioning</td>
                        <td>✓ Migrations in Git</td>
                    </tr>
                    <tr>
                        <td>Type Safety</td>
                        <td>✓ Compile-time checking</td>
                    </tr>
                    <tr>
                        <td>Best For</td>
                        <td>New projects, agile development</td>
                    </tr>
                </table>

                <h4>2. Database First Approach (Alternative)</h4>
                <p><strong>Overview:</strong> Database already exists, generate C# models from it.</p>

                <h5>Scaffold from Existing Database</h5>
                <pre><code class="language-bash"># Generate models from existing database
dotnet ef dbcontext scaffold \
    "Server=localhost;Database=ProductCatalogDB;Trusted_Connection=true" \
    Microsoft.EntityFrameworkCore.SqlServer \
    --output-dir Models
                </code></pre>

                <h5>Auto-Generated Code</h5>
                <pre><code class="language-csharp">// Auto-generated Models/Product.cs
public partial class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal? Price { get; set; }
    // ... Properties auto-created
}

// Auto-generated Data/ProductDbContext.cs
public partial class ProductDbContext : DbContext
{
    public virtual DbSet&lt;Product&gt; Products { get; set; }
    // ... DbSet auto-created
}
                </code></pre>

                <table class="comparison-table">
                    <tr>
                        <th>Aspect</th>
                        <th>Database First</th>
                    </tr>
                    <tr>
                        <td>Source of Truth</td>
                        <td>SQL Database</td>
                    </tr>
                    <tr>
                        <td>Schema Versioning</td>
                        <td>✗ Manual tracking</td>
                    </tr>
                    <tr>
                        <td>Flexibility</td>
                        <td>⚠ Regenerate overwrites changes</td>
                    </tr>
                    <tr>
                        <td>Best For</td>
                        <td>Legacy systems, existing databases</td>
                    </tr>
                </table>

                <h4>Code First vs Database First Comparison</h4>
                <table class="comparison-table">
                    <tr>
                        <th>Factor</th>
                        <th>Code First</th>
                        <th>Database First</th>
                    </tr>
                    <tr>
                        <td>Setup Time</td>
                        <td>Fast - start coding</td>
                        <td>Quick - scaffold only</td>
                    </tr>
                    <tr>
                        <td>Schema Changes</td>
                        <td>Easy - migrations</td>
                        <td>Manual - re-scaffold</td>
                    </tr>
                    <tr>
                        <td>When to Use</td>
                        <td>New projects ✓</td>
                        <td>Legacy projects ✓</td>
                    </tr>
                    <tr>
                        <td>Type Safety</td>
                        <td>Compile-time checks</td>
                        <td>Partial checks</td>
                    </tr>
                </table>

                <h3>Additional Query Patterns (All Approaches Use These)</h3>

                <h4>FindAsync() - Primary Key Lookup (FASTEST)</h4>
                <pre><code class="language-csharp">// From ProductService.cs
public async Task&lt;Product?&gt; GetProductByIdAsync(int id)
{
    // Check cache first
    if (_cache.TryGetValue($"product:{id}", out Product? cached))
        return cached;

    // FindAsync is optimized for ID lookups
    var product = await _context.Products.FindAsync(id);

    if (product == null || !product.IsActive)
        return null;

    // Cache for 5 minutes
    _cache.Set($"product:{id}", product,
        new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(5)));

    return product;
}

// Generated SQL: SELECT * FROM Products WHERE Id = @id
                </code></pre>

                <h4>2. WHERE Queries - Flexible Filtering</h4>
                <pre><code class="language-csharp">// Category filter with multiple conditions
public async Task&lt;List&lt;Product&gt;&gt; GetProductsByCategoryAsync(string category)
{
    var products = await _context.Products
        .Where(p => p.Category == category && p.IsActive)
        .OrderBy(p => p.Name)
        .AsNoTracking()      // Disable tracking for performance
        .ToListAsync();

    return products;
}

// Generated SQL:
// SELECT * FROM Products
// WHERE Category = @Category AND IsActive = 1
// ORDER BY Name
                </code></pre>

                <h4>3. UPDATE - Change Tracking</h4>
                <pre><code class="language-csharp">public async Task&lt;Product?&gt; UpdateProductAsync(int id, Product product)
{
    // Load existing product (into change tracker)
    var existing = await _context.Products.FindAsync(id);

    if (existing == null || !existing.IsActive)
        return null;

    // Modify properties
    existing.Name = product.Name;
    existing.Description = product.Description;
    existing.Price = product.Price;
    existing.UpdatedDate = DateTime.UtcNow;

    // SaveChangesAsync() detects changes
    await _context.SaveChangesAsync();

    // Invalidate cache
    _cache.Remove($"product:{id}");

    return existing;
}

// Generated SQL:
// UPDATE Products
// SET Name = @name, Description = @desc, Price = @price, ...
// WHERE Id = @id
                </code></pre>

                <h4>4. Soft Delete - Logical Deletion</h4>
                <pre><code class="language-csharp">public async Task&lt;bool&gt; DeleteProductAsync(int id)
{
    var product = await _context.Products.FindAsync(id);

    if (product == null || !product.IsActive)
        return false;

    // Soft delete: mark inactive
    product.IsActive = false;
    product.UpdatedDate = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    // Data preserved for audit trail!
    return true;
}

// Generated SQL:
// UPDATE Products SET IsActive = 0 WHERE Id = @id
// (No data loss - preserves audit trail)
                </code></pre>

                <h4>5. Stock Update - Atomic at Database</h4>
                <pre><code class="language-csharp">public async Task&lt;bool&gt; UpdateStockAsync(int id, int quantity)
{
    var product = await _context.Products.FindAsync(id);

    if (product == null || !product.IsActive)
        return false;

    product.StockQuantity += quantity;  // Negative for deduction
    product.UpdatedDate = DateTime.UtcNow;

    await _context.SaveChangesAsync();
    return true;
}

// Generated SQL:
// UPDATE Products
// SET StockQuantity = StockQuantity + @quantity
// WHERE Id = @id
//
// KEY: Calculation happens IN DATABASE
// Prevents race conditions in inventory!
                </code></pre>

                <h4>Key EF Core Concepts</h4>
                <ul>
                    <li><strong>FindAsync():</strong> Best for single entity by ID</li>
                    <li><strong>Change Tracking:</strong> EF detects modified properties</li>
                    <li><strong>SaveChangesAsync():</strong> Persists changes to database</li>
                    <li><strong>AsNoTracking():</strong> Skip tracking for reads (faster)</li>
                    <li><strong>Soft Delete:</strong> Mark IsActive = false instead of DELETE</li>
                </ul>
                `
            },
            {
                id: "ado-net-approaches",
                title: "ADO.NET: Closed vs Open Connection Patterns",
                content: `
                <h3>ADO.NET Connection Management Approaches</h3>

                <h4>1. Closed Connection Pattern (✅ ProductCatalogAPI Uses This)</h4>
                <p><strong>Overview:</strong> Open connection → Execute command → Close connection immediately. Connection returns to pool.</p>

                <h5>Typical Usage in ProductCatalogAPI</h5>
                <pre><code class="language-csharp">// Services/ProductAdoService.cs - Closed Connection Pattern
public async Task&lt;Product?&gt; GetProductByIdAsync(int id)
{
    try
    {
        // 1. Create connection
        using (SqlConnection conn = new SqlConnection(_connectionString))
        {
            string sql = "SELECT * FROM Products WHERE Id = @Id AND IsActive = 1";
            SqlCommand cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);

            // 2. Open connection
            await conn.OpenAsync();  // T=1ms

            // 3. Execute query
            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())  // T=5ms
            {
                if (await reader.ReadAsync())  // T=10ms
                {
                    return new Product { ... };
                }
            }
            // 4. Connection automatically closes here
        }  // T=11ms - Connection closed, returned to pool

        return null;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting product");
        throw;
    }
}

// Timeline: Total ~12ms per request
// Best for: Web APIs (stateless requests)
                </code></pre>

                <h4>Closed Connection Characteristics</h4>
                <table class="comparison-table">
                    <tr>
                        <th>Aspect</th>
                        <th>Details</th>
                    </tr>
                    <tr>
                        <td>Connection Lifecycle</td>
                        <td>Open → Close per command</td>
                    </tr>
                    <tr>
                        <td>Pool Efficiency</td>
                        <td>✓ Excellent (reuses connections)</td>
                    </tr>
                    <tr>
                        <td>Scalability</td>
                        <td>✓ 100+ concurrent requests</td>
                    </tr>
                    <tr>
                        <td>Transaction Support</td>
                        <td>Limited</td>
                    </tr>
                    <tr>
                        <td>Complexity</td>
                        <td>Simple</td>
                    </tr>
                </table>

                <h4>When to Use Closed Connection</h4>
                <ul>
                    <li>✓ Web APIs (stateless requests)</li>
                    <li>✓ ASP.NET Core applications</li>
                    <li>✓ Single operation per request</li>
                    <li>✓ Maximum scalability needed</li>
                    <li>✓ Most CRUD operations</li>
                    <li>✓ ProductCatalogAPI ✓</li>
                </ul>

                <hr>

                <h4>2. Open Connection Pattern (Advanced - Batch/Transactions)</h4>
                <p><strong>Overview:</strong> Keep connection open for multiple operations, then close once. Better for batch/transaction scenarios.</p>

                <h5>Batch Update Example (Conceptual)</h5>
                <pre><code class="language-csharp">// CONCEPTUAL: Open connection for batch operations
public async Task&lt;bool&gt; ProcessBulkUpdateAsync(List&lt;int&gt; productIds)
{
    using (SqlConnection conn = new SqlConnection(_connectionString))
    {
        // 1. Open ONCE for all operations
        await conn.OpenAsync();  // T=1ms

        // 2. Execute MULTIPLE commands on same connection
        foreach (var productId in productIds)
        {
            string sql = "UPDATE Products SET StockQuantity = StockQuantity - 1 WHERE Id = @Id";
            SqlCommand cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", productId);

            await cmd.ExecuteNonQueryAsync();  // T=2-50ms
        }

        // 3. Close connection ONCE at end
    }  // Connection closed here

    return true;
}

// Performance: One connection for 100 operations
// vs 100 connections with Closed Pattern
// Better for: Batch processing, bulk updates
                </code></pre>

                <h5>Open Connection with Transaction (Most Important Use Case)</h5>
                <pre><code class="language-csharp">// Conceptual: Atomic multi-step operation
public async Task&lt;bool&gt; TransferStockAsync(int fromId, int toId, int quantity)
{
    using (SqlConnection conn = new SqlConnection(_connectionString))
    {
        await conn.OpenAsync();

        // START TRANSACTION - All or nothing!
        using (SqlTransaction transaction = conn.BeginTransaction())
        {
            try
            {
                // Step 1: Reduce stock from source
                var cmd1 = new SqlCommand(
                    "UPDATE Products SET StockQuantity = StockQuantity - @Qty WHERE Id = @Id",
                    conn, transaction);
                cmd1.Parameters.AddWithValue("@Qty", quantity);
                cmd1.Parameters.AddWithValue("@Id", fromId);
                await cmd1.ExecuteNonQueryAsync();

                // Step 2: Increase stock to target
                var cmd2 = new SqlCommand(
                    "UPDATE Products SET StockQuantity = StockQuantity + @Qty WHERE Id = @Id",
                    conn, transaction);
                cmd2.Parameters.AddWithValue("@Qty", quantity);
                cmd2.Parameters.AddWithValue("@Id", toId);
                await cmd2.ExecuteNonQueryAsync();

                // If here, COMMIT both
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                // If error, ROLLBACK both
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Transfer failed");
                return false;
            }
        }
    }
}

// If Step 1 succeeds but Step 2 fails:
// Both are ROLLED BACK (atomicity guaranteed!)
                </code></pre>

                <h4>Open Connection Characteristics</h4>
                <table class="comparison-table">
                    <tr>
                        <th>Aspect</th>
                        <th>Details</th>
                    </tr>
                    <tr>
                        <td>Connection Lifecycle</td>
                        <td>Open once, multiple commands</td>
                    </tr>
                    <tr>
                        <td>Use Case</td>
                        <td>Batch/transaction operations</td>
                    </tr>
                    <tr>
                        <td>Performance</td>
                        <td>Better for 2+ related operations</td>
                    </tr>
                    <tr>
                        <td>Transaction Support</td>
                        <td>✓ Full (COMMIT/ROLLBACK)</td>
                    </tr>
                    <tr>
                        <td>Pool Impact</td>
                        <td>⚠ Ties up resources longer</td>
                    </tr>
                </table>

                <h4>When to Use Open Connection</h4>
                <ul>
                    <li>✓ Batch operations (bulk update)</li>
                    <li>✓ Multi-step transactions</li>
                    <li>✓ Data consistency critical (ACID guarantees)</li>
                    <li>✓ Desktop applications</li>
                    <li>✓ Background/scheduled jobs</li>
                    <li>✗ NOT for web APIs (ties up server resources)</li>
                </ul>

                <hr>

                <h4>Closed vs Open Connection Comparison</h4>
                <table class="comparison-table">
                    <tr>
                        <th>Factor</th>
                        <th>Closed Connection</th>
                        <th>Open Connection</th>
                    </tr>
                    <tr>
                        <td>Lifecycle</td>
                        <td>Open → Close per command</td>
                        <td>Open once, multiple commands</td>
                    </tr>
                    <tr>
                        <td>Use Case</td>
                        <td>Single query per request</td>
                        <td>Batch/transactions</td>
                    </tr>
                    <tr>
                        <td>Performance</td>
                        <td>Good</td>
                        <td>Better (fewer round-trips)</td>
                    </tr>
                    <tr>
                        <td>Transactions</td>
                        <td>Limited</td>
                        <td>Full support</td>
                    </tr>
                    <tr>
                        <td>Web APIs</td>
                        <td>✓ Perfect</td>
                        <td>✗ Not ideal</td>
                    </tr>
                    <tr>
                        <td>Scalability</td>
                        <td>Excellent</td>
                        <td>Good (uses resources)</td>
                    </tr>
                </table>

                <h3>Specific Query Patterns (Both Use These)</h3>

                <h4>1. Get All - Manual Collection Building</h4>
                <pre><code class="language-csharp">// From ProductAdoService.cs
public async Task&lt;List&lt;Product&gt;&gt; GetAllProductsAsync()
{
    var products = new List&lt;Product&gt;();  // Manual collection

    using (SqlConnection conn = new SqlConnection(_connectionString))
    {
        string sql = @"
            SELECT Id, Name, Description, Price, StockQuantity, Category,
                   CreatedDate, UpdatedDate, IsActive
            FROM Products
            WHERE IsActive = 1
            ORDER BY Name";

        SqlCommand cmd = new SqlCommand(sql, conn);
        await conn.OpenAsync();

        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                products.Add(new Product
                {
                    Id = (int)reader["Id"],
                    Name = (string)reader["Name"],
                    Price = (decimal)reader["Price"],
                    // ... manual mapping each column
                });
            }
        }
    }

    return products;
}

// Performance: ~100ms (no ORM overhead)
// Network: All columns transferred
// Memory: Manual management
                </code></pre>

                <h4>2. Parameterized Queries - SQL Injection Prevention</h4>
                <pre><code class="language-csharp">// SAFE: Parameterized query
string sql = "SELECT * FROM Products WHERE Id = @Id AND IsActive = 1";
SqlCommand cmd = new SqlCommand(sql, conn);
cmd.Parameters.AddWithValue("@Id", id);  // Separate from SQL

// UNSAFE: String concatenation (NEVER DO THIS!)
string sql = $"SELECT * FROM Products WHERE Id = {id}";
// If id = "1 OR 1=1" → Returns ALL rows!

// Always use parameters for any user input!
                </code></pre>

                <h4>3. INSERT with SCOPE_IDENTITY()</h4>
                <pre><code class="language-csharp">public async Task&lt;Product&gt; CreateProductAsync(Product product)
{
    using (SqlConnection conn = new SqlConnection(_connectionString))
    {
        string sql = @"
            INSERT INTO Products (Name, Description, Price, ...)
            VALUES (@Name, @Description, @Price, ...);
            SELECT SCOPE_IDENTITY();";  // Get inserted ID

        SqlCommand cmd = new SqlCommand(sql, conn);

        // Add parameters for every value
        cmd.Parameters.AddWithValue("@Name", product.Name);
        cmd.Parameters.AddWithValue("@Description", product.Description ?? "");
        cmd.Parameters.AddWithValue("@Price", product.Price);
        // ... more parameters

        await conn.OpenAsync();

        var result = await cmd.ExecuteScalarAsync();
        if (result != null)
        {
            product.Id = Convert.ToInt32(result);
        }
    }

    return product;
}

// Performance: Direct SQL, ~100ms
// Safety: Parameterized queries
// Control: Exact SQL execution
                </code></pre>

                <h4>4. UPDATE with @@ROWCOUNT Status</h4>
                <pre><code class="language-csharp">public async Task&lt;bool&gt; UpdateStockAsync(int id, int quantity)
{
    using (SqlConnection conn = new SqlConnection(_connectionString))
    {
        string sql = @"
            UPDATE Products
            SET StockQuantity = StockQuantity + @Quantity,
                UpdatedDate = @Updated
            WHERE Id = @Id AND IsActive = 1;
            SELECT @@ROWCOUNT;";

        SqlCommand cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", id);
        cmd.Parameters.AddWithValue("@Quantity", quantity);
        cmd.Parameters.AddWithValue("@Updated", DateTime.UtcNow);

        await conn.OpenAsync();

        var rowsAffected = await cmd.ExecuteScalarAsync();

        // @@ROWCOUNT = 1: Success
        // @@ROWCOUNT = 0: Not found
        return rowsAffected != null && (int)rowsAffected > 0;
    }
}

// KEY: Database performs calculation
// Atomic: Thread-safe at DB level
// Efficient: No fetch-modify-save cycle
                </code></pre>

                <h4>ADO.NET Pattern Template</h4>
                <pre><code class="language-csharp">// Repeat this pattern:
try
{
    using (SqlConnection conn = new SqlConnection(_connectionString))
    {
        string sql = "YOUR SQL HERE";
        SqlCommand cmd = new SqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("@Param", value);  // Always parameterize!

        await conn.OpenAsync();

        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
        {
            // Process results
        }
    }
}
catch (Exception ex)
{
    _logger.LogError(ex, "Database error");
    throw;
}
                </code></pre>

                <h4>ADO.NET Best Practices</h4>
                <ul>
                    <li>✓ ALWAYS use parameters (@name) for values</li>
                    <li>✓ Use 'using' statements for connections</li>
                    <li>✓ Close connections promptly</li>
                    <li>✓ Handle DBNull.Value explicitly</li>
                    <li>✗ NEVER concatenate SQL strings</li>
                    <li>✗ NEVER leave connections open</li>
                </ul>
                `
            },
            {
                id: "performance-comparison",
                title: "Performance Comparison & Decision Guide",
                content: `
                <h4>Query Execution Benchmarks</h4>
                <table class="comparison-table">
                    <tr>
                        <th>Operation</th>
                        <th>EF Core</th>
                        <th>ADO.NET</th>
                        <th>Cache Hit</th>
                    </tr>
                    <tr>
                        <td><strong>First Query</strong></td>
                        <td>150ms</td>
                        <td>100ms</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td><strong>Repeat Query</strong></td>
                        <td>140ms</td>
                        <td>95ms</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td><strong>Cached Result</strong></td>
                        <td>1ms</td>
                        <td>1ms</td>
                        <td>✓</td>
                    </tr>
                    <tr>
                        <td><strong>Improvement</strong></td>
                        <td>150x faster</td>
                        <td>100x faster</td>
                        <td>With IMemoryCache</td>
                    </tr>
                </table>

                <h4>Your Cache Performance</h4>
                <pre><code class="language-plaintext">100 Sequential Requests:
Request 1:   150ms (DB query)
Request 2-100: 1ms each (cache hits)

Total time: 150ms + 99ms = 249ms
Average: 2.5ms per request
Speedup: 99x faster than without cache!

Real-world impact:
- Without cache: 1000 requests = 150 seconds
- With cache:    1000 requests = 2.5 seconds
                </code></pre>

                <h4>Memory Usage Comparison</h4>
                <table class="comparison-table">
                    <tr>
                        <th>Scenario</th>
                        <th>Usage</th>
                        <th>Note</th>
                    </tr>
                    <tr>
                        <td><strong>EF with Tracking</strong></td>
                        <td>~8MB</td>
                        <td>Tracking overhead</td>
                    </tr>
                    <tr>
                        <td><strong>EF AsNoTracking</strong></td>
                        <td>~5MB</td>
                        <td>37% reduction</td>
                    </tr>
                    <tr>
                        <td><strong>ADO.NET</strong></td>
                        <td>~5MB</td>
                        <td>Manual management</td>
                    </tr>
                    <tr>
                        <td><strong>IMemoryCache</strong></td>
                        <td>~6MB</td>
                        <td>Stays in RAM</td>
                    </tr>
                </table>

                <h4>When to Use Each Approach</h4>
                <pre><code class="language-plaintext">USE EF CORE WHEN:
✓ Standard CRUD operations
✓ Complex business logic needed
✓ Rapid development priority
✓ Mixed queries and updates
✓ ORM benefits desired
Example: Your GetAllProductsAsync()

USE ADO.NET WHEN:
✓ Pure performance required
✓ Complex SQL (window functions, CTEs)
✓ Bulk operations on large datasets
✓ Stored procedures integration
✓ Network efficiency critical
Example: Inventory calculations

USE INMEMORYCACHE WHEN:
✓ Data accessed frequently (>80% hits)
✓ Data doesn't change often
✓ Single server deployment
✓ Size fits in memory
✓ 5-minute staleness acceptable
Example: Product list, categories

SCALE TO REDIS WHEN:
✓ Multiple servers
✓ Data must persist across app restarts
✓ Size exceeds available memory
✓ Need distributed cache
                </code></pre>

                <h4>Your Current Architecture (Optimal Balance)</h4>
                <pre><code class="language-plaintext">┌─────────────────┐
│  Client Request │
└────────┬────────┘
         │
    ┌────▼─────────────────────┐
    │  Check IMemoryCache      │ ← 1ms if HIT
    └────┬──────────────────────┘
         │ MISS
    ┌────▼──────────────────────────┐
    │  Query Database              │
    │  ┌─► EF Core (LINQ)  150ms   │
    │  ├─► ADO.NET (SQL)   100ms   │
    │  └─► GraphQL (EF+)   150ms   │
    └────┬──────────────────────────┘
         │
    ┌────▼─────────────────────┐
    │  Store in IMemoryCache   │ ← 5-min TTL
    └────┬──────────────────────┘
         │
    ┌────▼─────────────────────┐
    │  Return to Client        │
    └──────────────────────────┘

Performance Hierarchy:
💨 Cache HIT:        1ms    (99% of requests)
🔧 EF Core Query:   150ms   (first query)
⚡ ADO Query:       100ms   (faster but more code)
🎯 All requests:     2.5ms average (with cache)
                </code></pre>

                <h4>Optimization Checklist</h4>
                <ul>
                    <li>✅ Indexes on frequently searched columns (Category, Name)</li>
                    <li>✅ AsNoTracking() on all read queries</li>
                    <li>✅ IMemoryCache with appropriate TTL</li>
                    <li>✅ Soft delete pattern (IsActive flag)</li>
                    <li>✅ Parameterized queries (SQL injection safe)</li>
                    <li>✅ Async/await throughout</li>
                    <li>✅ Cache invalidation on mutations</li>
                    <li>⏳ Monitor cache hit rates in production</li>
                    <li>⏳ Scale horizontally before vertical</li>
                    <li>⏳ Add Redis when multi-server needed</li>
                </ul>

                <h4>Summary: Your Architecture is Excellent!</h4>
                <p>You have the perfect balance:</p>
                <ul>
                    <li>✅ EF Core for standard CRUD (maintainable)</li>
                    <li>✅ ADO.NET option for performance-critical ops</li>
                    <li>✅ GraphQL for flexible client queries</li>
                    <li>✅ IMemoryCache for 99x speed boost</li>
                    <li>✅ Soft delete for audit trail</li>
                    <li>✅ Atomic DB calculations for inventory</li>
                </ul>
                <p><strong>Result:</strong> Scalable, maintainable, high-performance system! Only optimize further when metrics show a constraint.</p>
                `
            }
        ]
    }
};

// Current phase
let currentPhase = 1;

// Load specific phase
function loadPhase(phaseNum) {
    currentPhase = phaseNum;
    const phase = phaseDocumentation[phaseNum];

    // Update active button
    document.querySelectorAll('.phase-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.phase == phaseNum) {
            btn.classList.add('active');
        }
    });

    // Load content
    let html = `<h1>${phase.title}</h1>`;
    html += `<p class="phase-estimate">⏱️ Estimated time: ${phase.timeEstimate}</p>`;

    phase.sections.forEach(section => {
        html += `
            <section class="doc-section" id="${section.id}">
                <h2>${section.title}</h2>
                <div class="doc-content">
                    ${section.content}
                </div>
            </section>
        `;
    });

    document.getElementById('docsContent').innerHTML = html;

    // Generate TOC
    let tocHtml = '';
    phase.sections.forEach(section => {
        tocHtml += `<li><a href="#${section.id}">${section.title}</a></li>`;
    });
    document.getElementById('tocList').innerHTML = tocHtml;

    // Update navigation buttons
    document.getElementById('prevBtn').style.display = currentPhase > 1 ? 'block' : 'none';
    document.getElementById('nextBtn').style.display = currentPhase < 10 ? 'block' : 'none';
    document.getElementById('phaseIndicator').textContent = `Phase ${currentPhase}/10`;

    // Highlight code
    document.querySelectorAll('pre code').forEach(block => {
        if (typeof hljs !== 'undefined') {
            hljs.highlightElement(block);
        }
    });

    // Scroll to top
    document.getElementById('docsContent').scrollIntoView({ behavior: 'smooth' });
}

function previousPhase() {
    if (currentPhase > 1) {
        loadPhase(currentPhase - 1);
    }
}

function nextPhase() {
    if (currentPhase < 10) {
        loadPhase(currentPhase + 1);
    }
}

// Load first phase on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);

    // Load first phase
    loadPhase(1);
});

// Make functions global for onclick handlers
window.loadPhase = loadPhase;
window.previousPhase = previousPhase;
window.nextPhase = nextPhase;
