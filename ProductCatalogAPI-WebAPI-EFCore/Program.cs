using ProductCatalogAPI.Data;
using ProductCatalogAPI.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

/*
 * IMPORTANT FLOW #5: DEPENDENCY INJECTION & CONFIGURATION
 *
 * This section sets up the application's dependencies using the Service Collection.
 * Dependencies are resolved by the .NET Core Dependency Injection container.
 *
 * Order matters: Register services before building the app.
 */

// IMPORTANT: Add DbContext with connection string
// UseInMemoryDatabase is for development/testing
// For production, use SQL Server, PostgreSQL, MySQL, etc.
string connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=(localdb)\\mssqllocaldb;Database=ProductCatalogDB;Trusted_Connection=true;";

builder.Services
    .AddDbContext<ProductDbContext>(options =>
        options.UseSqlServer(connectionString)
            .EnableSensitiveDataLogging(builder.Environment.IsDevelopment())
    );

// IMPORTANT: Register service layer
// Transient: New instance every time (good for stateless services)
// Scoped: One instance per request (good for DbContext and business logic)
// Singleton: One instance for application lifetime (good for configuration)
builder.Services.AddScoped<IProductService, ProductService>();

// Add standard ASP.NET Core services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS (Cross-Origin Resource Sharing) for React/Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000", "http://localhost:4200") // React and Angular ports
              .AllowAnyMethod()
              .AllowAnyHeader()
    );
});

var app = builder.Build();

/*
 * IMPORTANT FLOW #6: HTTP REQUEST PIPELINE
 *
 * The middleware pipeline determines how HTTP requests are processed.
 * Order matters: middleware runs in the order it's added.
 */

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS
app.UseCors("AllowFrontend");

// Map controllers (matches routes in ProductsController)
app.MapControllers();

app.Run();
