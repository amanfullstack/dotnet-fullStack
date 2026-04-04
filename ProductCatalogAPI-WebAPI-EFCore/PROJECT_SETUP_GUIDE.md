# 🚀 Project Setup Guide - ProductCatalogAPI-WebAPI-EFCore

Complete guide to recreate this project from scratch. Use this as a template for other projects.

---

## 📋 Table of Contents
1. [Project Information](#project-information)
2. [System Requirements](#system-requirements)
3. [Technology Stack](#technology-stack)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Folder Structure](#folder-structure)
6. [Dependencies Explained](#dependencies-explained)
7. [Configuration Files](#configuration-files)
8. [Database Setup](#database-setup)
9. [Verification Steps](#verification-steps)
10. [Commands Reference](#commands-reference)

---

## 📝 Project Information

| Property | Value |
|----------|-------|
| **Project Name** | ProductCatalogAPI-WebAPI-EFCore |
| **Project Type** | ASP.NET Core REST API |
| **Scenario** | E-Commerce Product Catalog CRUD Application |
| **Repository Path** | `d:\dotnet-fullStack\ProductCatalogAPI-WebAPI-EFCore\` |
| **Naming Convention** | `ProjectName-TechType` |
| **Created Date** | 2026-04-04 |
| **Framework** | .NET 8.0 (LTS) |
| **Architecture** | N-Tier (Controllers → Services → DbContext → Database) |

---

## 💻 System Requirements

### Development Machine
```
OS: Windows 11 Home Single Language (10.0.26200)
Processor: Any modern CPU
RAM: Minimum 4GB (8GB recommended)
Storage: 5GB+ free space
```

### Required Software
```
✅ .NET 8.0 SDK
✅ SQL Server (AMAN - Named instance) or LocalDB
✅ Visual Studio Code / Visual Studio 2022+ (optional)
✅ Git (optional)
✅ Terminal/Command Prompt or PowerShell
```

### Verify Installation
```bash
# Check .NET version
dotnet --version

# Expected output: 8.0.x or higher

# Check SDK versions
dotnet sdk list

# Verify workloads
dotnet workload list
```

---

## 🛠️ Technology Stack

### Core Framework
```
.NET 8.0 (Long-Term Support)
✓ Latest LTS version as of 2024
✓ Performance optimizations
✓ Built-in dependency injection
✓ Modern async/await support
```

### Web Framework
```
ASP.NET Core 8.0.8
✓ REST API development
✓ Built-in routing
✓ Middleware pipeline
✓ Dependency injection container
✓ Configuration management
```

### Database & ORM
```
Entity Framework Core 8.0.8
✓ Object-Relational Mapping
✓ LINQ to Entities queries
✓ Migrations for schema management
✓ Change tracking
✓ Lazy/Eager loading
```

### Database Server
```
SQL Server
✓ Full version (Server: AMAN)
✓ Or LocalDB (Server: (localdb)\mssqllocaldb)
✓ Windows Authentication / SQL Authentication
```

### API Documentation
```
Swagger/OpenAPI (Swashbuckle) 6.4.0
✓ Interactive API documentation
✓ Try-it-out functionality
✓ Auto-generated from code
✓ OpenAPI 3.0 specification
```

---

## 📦 Dependencies & Library Versions

### NuGet Packages

| Package | Version | Purpose |
|---------|---------|---------|
| **Microsoft.AspNetCore.OpenApi** | 8.0.8 | OpenAPI/Swagger support for ASP.NET Core |
| **Microsoft.EntityFrameworkCore** | 8.0.8 | ORM for database operations (included in others) |
| **Microsoft.EntityFrameworkCore.Design** | 8.0.8 | EF Core CLI tools (migrations) |
| **Microsoft.EntityFrameworkCore.SqlServer** | 8.0.8 | SQL Server database provider |
| **Swashbuckle.AspNetCore** | 6.4.0 | Swagger/OpenAPI implementation |

### Project File Properties
```xml
<TargetFramework>net8.0</TargetFramework>     <!-- .NET 8.0 targeting -->
<Nullable>enable</Nullable>                   <!-- Nullable reference types -->
<ImplicitUsings>enable</ImplicitUsings>       <!-- Global using statements -->
<Project Sdk="Microsoft.NET.Sdk.Web">         <!-- Web project type -->
```

---

## 🔧 Step-by-Step Setup

### Step 1: Create Project Directory

```bash
# Navigate to parent folder
cd d:\dotnet-fullStack

# Create project folder with naming convention
mkdir ProductCatalogAPI-WebAPI-EFCore

# Enter the folder
cd ProductCatalogAPI-WebAPI-EFCore
```

### Step 2: Create .NET Web API Project

```bash
# Create new ASP.NET Core Web API project
dotnet new webapi --framework net8.0 --name ProductCatalogAPI

# This creates:
# - ProductCatalogAPI.csproj
# - Program.cs
# - appsettings.json
# - appsettings.Development.json
# - Properties/ folder
# - Controllers/ folder (with default WeatherForecast)
```

**What this generates:**
```
├── ProductCatalogAPI.csproj      (Project file with default packages)
├── Program.cs                     (Application entry point)
├── appsettings.json               (Configuration file)
├── appsettings.Development.json   (Development configuration)
├── Properties/
│   ├── launchSettings.json        (Port & debugging settings)
├── Controllers/
│   └── WeatherForecastController.cs (Default template - DELETE this)
└── bin/, obj/ (build artifacts)
```

### Step 3: Add NuGet Packages

```bash
# Add Entity Framework Core for SQL Server
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.8

# Add EF Core Design tools (for migrations CLI)
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.8

# Add Swagger/OpenAPI
dotnet add package Swashbuckle.AspNetCore --version 6.4.0

# Add OpenAPI support
dotnet add package Microsoft.AspNetCore.OpenApi --version 8.0.8
```

**Alternative: Edit .csproj directly**
```bash
# Instead of dotnet add, you can manually edit ProductCatalogAPI.csproj:
# Copy the ItemGroup with PackageReference entries (see Section 5)
# Then run: dotnet restore
```

### Step 4: Create Folder Structure

```bash
# Create Models folder (Entity classes)
mkdir Models

# Create Data folder (DbContext)
mkdir Data

# Create Services folder (Business logic)
mkdir Services

# Remove default template
rmdir /s Controllers\WeatherForecastController.cs
```

### Step 5: Create Models (Database Entities)

**File: Models/Product.cs**
```bash
# See complete code in the Models/Product.cs file
# Contains:
# - Id (Primary Key, auto-increment)
# - Name (Product name, indexed)
# - Description (Product details)
# - Price (Decimal for currency)
# - StockQuantity (Integer)
# - Category (Product type, indexed)
# - CreatedDate (Timestamp)
# - UpdatedDate (Timestamp)
# - IsActive (Soft delete flag)
```

### Step 6: Create DbContext (Data Access Layer)

**File: Data/ProductDbContext.cs**
```bash
# See ProductDbContext.cs for:
# - DbSet<Product> configuration
# - OnModelCreating() for schema setup
# - Database indexes
# - Default values for timestamps
# - Decimal precision for Price
```

### Step 7: Create Service Layer (Business Logic)

**File: Services/IProductService.cs** (Interface)
```bash
# Defines contract for CRUD operations
# Methods: CreateAsync, GetAllAsync, GetByIdAsync, UpdateAsync, DeleteAsync, etc.
```

**File: Services/ProductService.cs** (Implementation)
```bash
# Implements business logic
# Error handling, validation, transactions
# Uses DbContext for data access
```

### Step 8: Create Controller (API Endpoints)

**File: Controllers/ProductsController.cs**
```bash
# REST API endpoints:
# - POST /api/products (Create)
# - GET /api/products (Read all)
# - GET /api/products/{id} (Read single)
# - GET /api/products/category/{category} (Filter)
# - PUT /api/products/{id} (Update)
# - PATCH /api/products/{id}/stock (Update stock)
# - DELETE /api/products/{id} (Soft delete)
```

### Step 9: Configure Program.cs (Dependency Injection)

**File: Program.cs**

Key configurations:
```csharp
// 1. Add DbContext
builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseSqlServer(connectionString)
           .EnableSensitiveDataLogging(builder.Environment.IsDevelopment())
);

// 2. Add Services (Dependency Injection)
builder.Services.AddScoped<IProductService, ProductService>();

// 3. Add Controllers
builder.Services.AddControllers();

// 4. Add Swagger
builder.Services.AddSwaggerGen();
builder.Services.AddEndpointsApiExplorer();

// 5. Add CORS (for React/Angular)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000", "http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
    );
});

// 6. Use middleware
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowFrontend");
app.MapControllers();
```

### Step 10: Configure Database Connection

**File: appsettings.json**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=AMAN;Database=ProductCatalogDB;Trusted_Connection=true;Encrypt=false;TrustServerCertificate=true;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### Step 11: Create Initial Migration

```bash
# Generate migration from your DbContext model
dotnet ef migrations add InitialCreate

# This creates:
# - Migrations/[timestamp]_InitialCreate.cs
# - Migrations/[timestamp]_InitialCreate.Designer.cs
# - Migrations/ProductDbContextModelSnapshot.cs
```

### Step 12: Apply Migration to Database

```bash
# Execute migration and create database
dotnet ef database update

# This:
# ✓ Creates ProductCatalogDB database
# ✓ Creates Products table
# ✓ Creates indexes
# ✓ Tracks migration history
```

### Step 13: Build and Run

```bash
# Restore packages and build
dotnet build

# Run the project
dotnet run

# Project runs on:
# - http://localhost:5000 (API)
# - http://localhost:5000/swagger (Swagger UI)
```

---

## 📁 Folder Structure & Purpose

```
ProductCatalogAPI-WebAPI-EFCore/                    # Root project folder
│
├── 📄 ProductCatalogAPI.csproj                     # Project file (dependencies, framework)
│
├── 📄 Program.cs                                   # Application entry point & DI setup
│
├── ⚙️  appsettings.json                            # Configuration (connection strings, logging)
├── ⚙️  appsettings.Development.json                # Development-specific config
│
├── 📁 Properties/                                  # Project properties & launch settings
│   └── launchSettings.json                         # Port, Kestrel config, environment vars
│
├── 📁 Models/                                      # Entity classes (database entities)
│   └── Product.cs                                  # Product entity with all properties
│       # Contains: Id, Name, Description, Price, StockQuantity, Category
│       #           CreatedDate, UpdatedDate, IsActive (soft delete)
│
├── 📁 Data/                                        # Data access layer (DbContext)
│   └── ProductDbContext.cs                         # EF Core DbContext
│       # DbSet<Product> definition
│       # OnModelCreating: indexes, decimal precision, default values
│       # Shadow tracking for timestamps
│
├── 📁 Services/                                    # Business logic layer
│   ├── IProductService.cs                          # Service interface (contract)
│   │   # Methods: CreateAsync, GetAllAsync, GetByIdAsync, GetByCategoryAsync,
│   │   #          UpdateAsync, UpdateStockAsync, DeleteAsync
│   └── ProductService.cs                           # Service implementation
│       # CRUD operations with validation
│       # Error handling with try-catch
│       # Soft delete logic (IsActive flag)
│
├── 📁 Controllers/                                 # API endpoints (presentation layer)
│   └── ProductsController.cs                       # REST API controller
│       # POST   /api/products/              → Create
│       # GET    /api/products/              → Get all
│       # GET    /api/products/{id}          → Get by ID
│       # GET    /api/products/category/{cat}→ Get by category
│       # PUT    /api/products/{id}          → Update full
│       # PATCH  /api/products/{id}/stock    → Update stock
│       # DELETE /api/products/{id}          → Soft delete
│
├── 📁 Migrations/                                  # Database migration history
│   ├── [timestamp]_InitialCreate.cs                # Migration definition
│   ├── [timestamp]_InitialCreate.Designer.cs       # Designer metadata
│   └── ProductDbContextModelSnapshot.cs            # Current schema snapshot
│
├── 📁 bin/                                         # Compiled output (auto-generated)
│   ├── Debug/
│   └── Release/
│
├── 📁 obj/                                         # Build artifacts (auto-generated)
│
└── 📚 Documentation Files (optional)
    ├── README.md                                   # Quick start guide
    ├── API_DOCUMENTATION.md                        # Complete API reference
    ├── LEARNING_GUIDE.md                           # Educational guide
    ├── PROJECT_SETUP_GUIDE.md                      # This file
    └── ProductCatalogAPI.http                      # REST Client test file
```

### Layer Explanation

```
PRESENTATION LAYER
├── Controllers/ProductsController.cs
│   └── Handles HTTP requests/responses
│       Routing: /api/products/{action}
│       Dependency: IProductService

BUSINESS LOGIC LAYER
├── Services/ProductService.cs & IProductService.cs
│   ├── Implements CRUD operations
│   ├── Validation logic
│   ├── Error handling
│   └── Dependency: ProductDbContext

DATA ACCESS LAYER
├── Data/ProductDbContext.cs
│   ├── Models: DbSet<Product>
│   ├── Entity configuration
│   ├── Database mapping
│   └── Dependency: SQL Server

DATABASE LAYER
└── SQL Server / ProductCatalogDB
    └── Products table with indexes
```

---

## 📦 Dependencies Explained

### 1. Microsoft.EntityFrameworkCore.SqlServer (8.0.8)
```
Purpose: ORM for SQL Server database
What it does:
  ✓ Maps C# classes to database tables
  ✓ Executes LINQ queries as SQL
  ✓ Manages connections and transactions
  ✓ Tracks object changes
  ✓ Generates SQL automatically

Used in: ProductDbContext, Services layer

Example:
  var product = await context.Products
      .Where(p => p.Id == id && p.IsActive)
      .FirstOrDefaultAsync();
```

### 2. Microsoft.EntityFrameworkCore.Design (8.0.8)
```
Purpose: Tools for migrations and scaffolding
What it does:
  ✓ Enables: dotnet ef migrations add
  ✓ Enables: dotnet ef database update
  ✓ Generates migration files
  ✓ Creates snapshots of schema
  ✓ Provides CLI for code-first database

Used in: CLI commands, never directly in code
```

### 3. Swashbuckle.AspNetCore (6.4.0)
```
Purpose: REST API documentation (Swagger/OpenAPI)
What it does:
  ✓ Auto-generates API documentation
  ✓ Provides interactive Swagger UI
  ✓ Shows all endpoints, parameters, responses
  ✓ Allows testing endpoints from UI
  ✓ Generates OpenAPI specification

Used in: Program.cs middleware
Accessed at: http://localhost:5000/swagger
```

### 4. Microsoft.AspNetCore.OpenApi (8.0.8)
```
Purpose: OpenAPI specification support
What it does:
  ✓ Adds OpenAPI/Swagger middleware support
  ✓ Works with Swashbuckle for documentation
  ✓ Auto-discovers API endpoints
  ✓ Generates OpenAPI 3.0 spec

Used in: Program.cs
```

### Built-in (included by default)
```
✓ Microsoft.AspNetCore.App
  - Controllers, routing, middleware

✓ Microsoft.NETCore.App
  - Core runtime, base libraries

✓ System packages (LINQ, Async, etc.)
```

---

## ⚙️ Configuration Files

### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=AMAN;Database=ProductCatalogDB;Trusted_Connection=true;Encrypt=false;TrustServerCertificate=true;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

**Connection String Breakdown:**
```
Server=AMAN                          # SQL Server instance name (or (localdb)\mssqllocaldb)
Database=ProductCatalogDB            # Database name
Trusted_Connection=true              # Windows authentication
Encrypt=false;                       # No SSL encryption (development)
TrustServerCertificate=true;         # Trust self-signed certs (development)
```

### appsettings.Development.json
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Debug"
    }
  }
}
```

### Program.cs Key Sections

**1. DbContext Configuration:**
```csharp
string connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=(localdb)\\mssqllocaldb;Database=ProductCatalogDB;Trusted_Connection=true;";

builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseSqlServer(connectionString)
           .EnableSensitiveDataLogging(builder.Environment.IsDevelopment())
);
```

**2. Dependency Injection:**
```csharp
// Scoped: One instance per HTTP request (good for DbContext + services)
builder.Services.AddScoped<IProductService, ProductService>();

// Service accesses DbContext, DbContext tracks changes during request
```

**3. CORS Configuration:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000", "http://localhost:4200") // React, Angular
              .AllowAnyMethod()    // GET, POST, PUT, DELETE, etc.
              .AllowAnyHeader()    // Content-Type, Authorization, etc.
    );
});
```

---

## 🗄️ Database Setup

### Database Creation Flow

```
1. dotnet ef migrations add InitialCreate
   ↓ Generates: Migrations/[timestamp]_InitialCreate.cs
   ↓ Defines: CREATE TABLE, CREATE INDEX statements

2. dotnet ef database update
   ↓ Executes migrations
   ↓ Creates: ProductCatalogDB
   ↓ Creates: Products table
   ↓ Creates: Indexes (Name, Category)
   ↓ Tracks: __EFMigrationsHistory
```

### Products Table Schema

```sql
CREATE TABLE [Products] (
    [Id] INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL,
    [Description] NVARCHAR(500) NOT NULL,
    [Price] DECIMAL(10,2) NOT NULL,
    [StockQuantity] INT NOT NULL,
    [Category] NVARCHAR(50) NOT NULL,
    [CreatedDate] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedDate] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
    [IsActive] BIT NOT NULL DEFAULT 1
);

-- Indexes for performance
CREATE INDEX [IX_Product_Name] ON [Products] ([Name]);
CREATE INDEX [IX_Product_Category] ON [Products] ([Category]);
```

### Entity Mapping (OnModelCreating)

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Entity: Products
    modelBuilder.Entity<Product>(entity =>
    {
        // Primary key
        entity.HasKey(e => e.Id);

        // Properties
        entity.Property(e => e.Name)
            .HasMaxLength(100)
            .IsRequired();

        entity.Property(e => e.Description)
            .HasMaxLength(500);

        entity.Property(e => e.Price)
            .HasPrecision(10, 2);  // Total digits: 10, Decimal places: 2

        entity.Property(e => e.CreatedDate)
            .HasDefaultValueSql("GETUTCDATE()");

        entity.Property(e => e.UpdatedDate)
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        entity.HasIndex(e => e.Name);
        entity.HasIndex(e => e.Category);
    });
}
```

---

## ✅ Verification Steps

### Step 1: Verify .NET Installation
```bash
dotnet --version
# Expected: 8.0.x

dotnet --info
# Shows SDK, runtime, architecture
```

### Step 2: Verify Project Structure
```bash
# Should see all folders and files
dir

# Expected output:
# - Models/
# - Services/
# - Data/
# - Controllers/
# - Migrations/
# - Properties/
# - ProductCatalogAPI.csproj
# - Program.cs
# - appsettings.json
```

### Step 3: Verify Package Restoration
```bash
dotnet restore

# Successfully restored packages if no errors
```

### Step 4: Verify Build
```bash
dotnet build

# Expected: Build succeeded 0 Error(s)
```

### Step 5: Verify Database Connection
```bash
# Check if database connection works
dotnet ef migrations list

# Expected: Shows InitialCreate migration as applied
```

### Step 6: Verify Application Runs
```bash
dotnet run

# Expected:
# - No build errors
# - Application listening on http://localhost:5000
# - No runtime errors
```

### Step 7: Verify API Endpoints
```bash
# Test GET endpoint
curl http://localhost:5000/api/products

# Test Swagger UI
Open browser: http://localhost:5000/swagger
```

### Step 8: Verify Database Created
```bash
# SQL Server: Verify ProductCatalogDB exists
# Check if Products table has data (if added)
```

---

## 📋 Commands Reference

### Project Creation Commands

| Command | Purpose |
|---------|---------|
| `dotnet new webapi --framework net8.0` | Create new API project |
| `dotnet add package NAME --version VERSION` | Add NuGet package |
| `dotnet restore` | Restore packages from .csproj |

### Build & Run Commands

| Command | Purpose |
|---------|---------|
| `dotnet build` | Compile project |
| `dotnet run` | Build and run |
| `dotnet build --configuration Release` | Build for production |
| `dotnet build --no-incremental` | Full rebuild |

### Entity Framework Commands

| Command | Purpose |
|---------|---------|
| `dotnet ef migrations add NAME` | Create migration |
| `dotnet ef migrations list` | List all migrations |
| `dotnet ef database update` | Apply migrations to DB |
| `dotnet ef database update -1` | Revert last migration |
| `dotnet ef migrations remove` | Remove last migration |
| `dotnet ef database drop` | Delete database |
| `dotnet ef dbcontext info` | Show DbContext info |

### Debugging Commands

| Command | Purpose |
|---------|---------|
| `dotnet run --configuration Debug` | Run in debug mode |
| `dotnet build --verbosity detailed` | Verbose build output |
| `dotnet ef migrations script` | Generate migration SQL script |

### Project Information

| Command | Purpose |
|---------|---------|
| `dotnet --version` | Show .NET version |
| `dotnet sdk list` | List installed SDKs |
| `dotnet workload list` | Show installed workloads |
| `dotnet list package` | Show NuGet packages |

---

## 🔄 Complete Command Sequence (From Scratch)

```bash
# 1. Navigate to parent folder
cd d:\dotnet-fullStack

# 2. Create project folder
mkdir ProductCatalogAPI-WebAPI-EFCore
cd ProductCatalogAPI-WebAPI-EFCore

# 3. Create .NET Web API project
dotnet new webapi --framework net8.0 --name ProductCatalogAPI

# 4. Add NuGet packages
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.8
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.8
dotnet add package Swashbuckle.AspNetCore --version 6.4.0
dotnet add package Microsoft.AspNetCore.OpenApi --version 8.0.8

# 5. Create folders
mkdir Models
mkdir Data
mkdir Services

# 6. Delete default template
rm Controllers/WeatherForecastController.cs

# 7. Add files:
#    - Models/Product.cs (entity)
#    - Data/ProductDbContext.cs (DbContext)
#    - Services/IProductService.cs (interface)
#    - Services/ProductService.cs (implementation)
#    - Controllers/ProductsController.cs (API)
#    - Update Program.cs (DI, middleware)
#    - Update appsettings.json (connection string)

# 8. Build project
dotnet build

# 9. Create migration
dotnet ef migrations add InitialCreate

# 10. Apply migration
dotnet ef database update

# 11. Run project
dotnet run

# 12. Verify
# Open: http://localhost:5000/swagger
```

---

## 📌 Important Notes

### For Replication in Other Projects

1. **Naming Convention:** `ProjectName-TechType`
   - Examples: `ProjectCatalogMVC-ASP.NET-MVC`, `ProductUI-React-JavaScript`

2. **Folder Structure:** Always follow N-Tier pattern
   - Controllers (Presentation)
   - Services (Business Logic)
   - Data (Data Access)
   - Models (Entities)

3. **Dependencies:** Check target framework version
   - Update package versions if .NET version changes
   - Always use LTS versions for production

4. **Programs.cs:** Key sections to replicate
   - DbContext registration
   - Service registration (Scoped for DbContext)
   - CORS configuration
   - Middleware pipeline order

5. **Connection String:** Update server/database names
   - Change `Server=AMAN` to your server
   - Change `Database=ProductCatalogDB` to your database name
   - Adjust authentication method if needed

6. **Documentation:** Create same structure for each project
   - README.md
   - PROJECT_SETUP_GUIDE.md
   - Complete documentation file
   - Test/example files

---

## 🎓 Learning Outcomes

After following this guide, you understand:

✅ How to create .NET Web API from scratch
✅ Package management with NuGet
✅ Entity Framework Core setup and migrations
✅ Dependency injection configuration
✅ N-Tier architecture pattern
✅ Database-first vs Code-first approach
✅ CORS configuration for frontend integration
✅ API endpoint routing and controllers
✅ Service layer abstraction
✅ DbContext configuration and model mapping

---

## 🔗 Related Resources

- [.NET 8.0 Documentation](https://learn.microsoft.com/en-us/dotnet/)
- [Entity Framework Core Docs](https://learn.microsoft.com/en-us/ef/core/)
- [ASP.NET Core Docs](https://learn.microsoft.com/en-us/aspnet/core/)
- [Swagger/OpenAPI](https://swagger.io/)

---

**Template Version:** 1.0
**Last Updated:** 2026-04-04
**Applicable To:** ProductCatalogAPI-WebAPI-EFCore & similar projects

