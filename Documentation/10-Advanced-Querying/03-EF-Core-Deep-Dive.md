# EF Core Deep Dive - All Approaches from ProductCatalogAPI

## Overview

Entity Framework Core is an ORM (Object-Relational Mapper) that maps C# objects to database rows. It handles queries, updates, and change tracking automatically.

---

## 1. DbContext - The Heart of EF Core

### What It Is
`DbContext` represents a session with the database. It tracks changes and manages the lifecycle of entities.

### From ProductCatalogAPI Project

**File:** `Data/ProductDbContext.cs`

```csharp
public class ProductDbContext : DbContext
{
    // Constructor receives DbContextOptions from dependency injection
    public ProductDbContext(DbContextOptions<ProductDbContext> options)
        : base(options)
    {
    }

    // DbSet<T> represents a table in the database
    // Strongly-typed access to Products table
    public DbSet<Product> Products { get; set; }
}
```

**File:** `Program.cs` (Line 45-52)

```csharp
// Register DbContext with dependency injection
builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("ProductCatalogAPI-WebAPI-EFCore")
    )
);

// This makes ProductDbContext available throughout the application
// Each HTTP request gets a scoped instance
```

### Key Concepts

| Concept | Purpose |
|---------|---------|
| **DbSet<T>** | Represents a table, allows CRUD operations |
| **Scoped Lifetime** | Each request gets new DbContext instance |
| **Change Tracker** | Tracks modified entities |
| **Migrations** | Version control for database schema |

---

## 2. EF Core Approaches - Code First vs Database First

### 2A. Code First (USED IN ProductCatalogAPI) ✅

**What It Is:**
Define your C# models first, then generate database schema from them using migrations.

**From ProductCatalogAPI Project - This is what we use!**

**Step 1: Define Model**
```csharp
// File: Models/Product.cs
public class Product
{
    public int Id { get; set; }  // Primary Key
    public string Name { get; set; }  // Will map to nvarchar(100) in DB
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string Category { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
    public bool IsActive { get; set; }  // Soft delete flag
}
```

**Step 2: Define DbContext**
```csharp
// File: Data/ProductDbContext.cs
public class ProductDbContext : DbContext
{
    public ProductDbContext(DbContextOptions<ProductDbContext> options)
        : base(options) { }

    public DbSet<Product> Products { get; set; }

    // Configure model in code
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(100);
            entity.HasIndex(p => p.Category);
        });
    }
}
```

**Step 3: Create Migration**
```bash
# This generates SQL from your C# models
dotnet ef migrations add InitialCreate --project ProductCatalogAPI-WebAPI-EFCore

# Generated: Migrations/20240101120000_InitialCreate.cs
# Contains: Up() method to create table, Down() method to rollback
```

**Step 4: Apply to Database**
```bash
# Executes the migration SQL against your database
dotnet ef database update --project ProductCatalogAPI-WebAPI-EFCore

# Creates: Products table with Id, Name, Description, Price, etc.
```

**Code First Workflow:**
```
Define C# Models
    ↓
DbContext with DbSets
    ↓
Create Migration (generates SQL)
    ↓
Database Update (applies SQL)
    ↓
Database schema created from code
```

**Advantages:**
✅ Version control for database schema (migrations in Git)
✅ Easy to evolve schema as requirements change
✅ Type-safe, compile-time checking
✅ Simple for new projects (greenfield)
✅ Changes tracked in migration files

**When to Use:**
- New projects (no existing database)
- Team projects (schema changes tracked in Git)
- When you want C# as source of truth

---

### 2B. Database First (Conceptual - Not in ProjectCatalogAPI)

**What It Is:**
Database already exists, generate C# models from it using scaffolding.

**Example (Conceptual Code - Not in our project):**

**Step 1: Have existing database**
```sql
-- Database already created with Products table
CREATE TABLE Products (
    Id INT PRIMARY KEY IDENTITY,
    Name NVARCHAR(100) NOT NULL,
    Price DECIMAL(10,2),
    CreatedDate DATETIME DEFAULT GETUTCDATE()
);
```

**Step 2: Scaffold Models from Database**
```bash
# Reverse-engineers database to generate C# models
dotnet ef dbcontext scaffold \
    "Server=localhost;Database=ProductCatalogDB;Trusted_Connection=true" \
    Microsoft.EntityFrameworkCore.SqlServer \
    --project ProductCatalogAPI-WebAPI-EFCore \
    --output-dir Models \
    --context ProductDbContext
```

**Generated Code (auto-created):**
```csharp
// File: Models/Product.cs (Auto-generated)
public partial class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal? Price { get; set; }
    public DateTime? CreatedDate { get; set; }
}

// File: Data/ProductDbContext.cs (Auto-generated)
public partial class ProductDbContext : DbContext
{
    public virtual DbSet<Product> Products { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("...");

    protected override void OnModelCreating(ModelBuilder modelBuilder) { ... }
}
```

**Database First Workflow:**
```
Existing Database
    ↓
Scaffold Command
    ↓
Auto-generate C# Models
    ↓
Auto-generate DbContext
    ↓
Use in application
```

**Advantages:**
✅ Works with existing databases
✅ Quick start for legacy systems
✅ Database is source of truth

**Disadvantages:**
❌ Generated code can become messy
❌ Manual changes to models get overwritten on re-scaffold
❌ Harder to version control schema changes
❌ Not ideal for new projects

**When to Use:**
- Legacy applications with existing database
- Large/complex databases created by DBAs
- Database-first organizations

---

## 3. Reading Data - Various Approaches

### 2.1 FindAsync() - Primary Key Lookup (FASTEST for single ID)

**File:** `Services/ProductService.cs` (Line 147-176)

```csharp
public async Task<Product?> GetProductByIdAsync(int id)
{
    string cacheKey = $"{CACHE_KEY_PRODUCT_PREFIX}{id}";

    // Check cache first
    if (_cache.TryGetValue(cacheKey, out Product? cachedProduct))
    {
        Console.WriteLine($"✓ CACHE HIT: GetProductById({id})");
        return cachedProduct;
    }

    Console.WriteLine($"✗ CACHE MISS: GetProductById({id})");

    // IMPORTANT: FindAsync is optimized for primary key lookup
    // Checks identity map first (in-memory cache within DbContext)
    // Then queries database: SELECT * FROM Products WHERE Id = @id
    var product = await _context.Products.FindAsync(id);

    // Return null if not found or if soft-deleted
    if (product == null || !product.IsActive)
    {
        return null;
    }

    // Cache the product for 5 minutes
    var cacheOptions = new MemoryCacheEntryOptions()
        .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

    _cache.Set(cacheKey, product, cacheOptions);

    return product;
}
```

**Key Performance Points:**
- FindAsync() has 2 levels of caching:
  1. DbContext's change tracker (identity map)
  2. Your custom IMemoryCache
- Generates simple, fast SQL
- Includes change tracking (entities can be modified)

---

### 2.2 Single Query with WHERE - Get All Active

**File:** `Services/ProductService.cs` (Line 106-134)

```csharp
public async Task<List<Product>> GetAllProductsAsync()
{
    // Check memory cache first
    if (_cache.TryGetValue(CACHE_KEY_ALL_PRODUCTS, out List<Product>? cachedProducts))
    {
        Console.WriteLine($"✓ CACHE HIT: GetAllProducts returning {cachedProducts?.Count} products");
        return cachedProducts!;
    }

    Console.WriteLine("✗ CACHE MISS: GetAllProducts fetching from database");

    // Query with multiple operations - still IQueryable until ToListAsync()
    var products = await _context.Products
        .Where(p => p.IsActive)              // Filter (not deleted)
        .OrderBy(p => p.Name)                // Sort by name
        .AsNoTracking()                      // Don't track changes (read-only)
        .ToListAsync();                      // Execute query NOW

    // Generated SQL:
    // SELECT * FROM Products
    // WHERE IsActive = 1
    // ORDER BY Name

    // Cache the list
    var cacheOptions = new MemoryCacheEntryOptions()
        .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

    _cache.Set(CACHE_KEY_ALL_PRODUCTS, products, cacheOptions);

    return products;
}
```

**Performance Characteristics:**
- All filtering happens at database
- Only active products transferred over network
- AsNoTracking() = ~30% faster (no change tracking overhead)
- ToListAsync() materializes data into memory

---

### 2.3 Filtered Query - Get by Category

**File:** `Services/ProductService.cs` (Line 195-210)

```csharp
public async Task<List<Product>> GetProductsByCategoryAsync(string category)
{
    string cacheKey = $"{CACHE_KEY_CATEGORY_PREFIX}{category}";

    // Two-level cache check
    if (_cache.TryGetValue(cacheKey, out List<Product>? cachedProducts))
    {
        Console.WriteLine($"✓ CACHE HIT: GetProductsByCategory({category}) returning {cachedProducts?.Count} products");
        return cachedProducts!;
    }

    Console.WriteLine($"✗ CACHE MISS: GetProductsByCategory({category}) fetching from database");

    // Build query with multiple conditions
    var products = await _context.Products
        .Where(p => p.Category == category && p.IsActive)  // Multiple conditions = AND
        .OrderBy(p => p.Name)                              // Order by name
        .AsNoTracking()                                    // Performance optimization
        .ToListAsync();                                    // Execute now

    // Generated SQL:
    // SELECT * FROM Products
    // WHERE Category = @category AND IsActive = 1
    // ORDER BY Name

    // Cache for 5 minutes
    var cacheOptions = new MemoryCacheEntryOptions()
        .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

    _cache.Set(cacheKey, products, cacheOptions);

    return products;
}
```

---

## 3. Creating Data - INSERT

**File:** `Services/ProductService.cs` (Line 213-227)

```csharp
public async Task<Product> CreateProductAsync(Product product)
{
    // Add entity to DbContext
    // EF now tracks this entity as "Added"
    _context.Products.Add(product);

    // SaveChangesAsync() generates INSERT statement
    // Sets CreatedDate/UpdatedDate via default values
    // Returns generated Id from database
    await _context.SaveChangesAsync();

    // Invalidate related caches
    _cache.Remove(CACHE_KEY_ALL_PRODUCTS);
    _cache.Remove($"{CACHE_KEY_CATEGORY_PREFIX}{product.Category}");
    Console.WriteLine($"✓ CACHE INVALIDATED: Product created '{product.Name}'");

    return product;  // Return with Id populated
}

// Generated SQL:
// INSERT INTO Products (Name, Description, Price, StockQuantity, Category, CreatedDate, UpdatedDate, IsActive)
// VALUES (@name, @description, @price, @stockQuantity, @category, @createdDate, @updatedDate, @isActive)
```

**Key Points:**
- `Add()` marks entity for insertion
- `SaveChangesAsync()` executes the INSERT
- Database generates Id (IDENTITY in SQL Server)
- EF automatically populates the Id on the C# object

---

## 4. Updating Data - UPDA TE

**File:** `Services/ProductService.cs` (Line 229-265)

```csharp
public async Task<Product?> UpdateProductAsync(int id, Product product)
{
    // Fetch existing product (loaded into change tracker)
    var existingProduct = await _context.Products.FindAsync(id);

    // Return null if not found or already deleted
    if (existingProduct == null || !existingProduct.IsActive)
    {
        return null;
    }

    string oldCategory = existingProduct.Category;

    // Modify properties
    // IMPORTANT: Only update properties provided, preserve Id and CreatedDate
    existingProduct.Name = product.Name;
    existingProduct.Description = product.Description;
    existingProduct.Price = product.Price;
    existingProduct.StockQuantity = product.StockQuantity;
    existingProduct.Category = product.Category;
    existingProduct.UpdatedDate = DateTime.UtcNow;

    // SaveChangesAsync() detects changes and generates UPDATE
    // Only modified columns included in UPDATE
    await _context.SaveChangesAsync();

    // Generated SQL:
    // UPDATE Products
    // SET Name = @name, Description = @desc, Price = @price,
    //     StockQuantity = @stock, Category = @category, UpdatedDate = @updated
    // WHERE Id = @id

    // Invalidate caches
    _cache.Remove($"{CACHE_KEY_PRODUCT_PREFIX}{id}");
    _cache.Remove(CACHE_KEY_ALL_PRODUCTS);
    _cache.Remove($"{CACHE_KEY_CATEGORY_PREFIX}{oldCategory}");
    if (oldCategory != existingProduct.Category)
    {
        _cache.Remove($"{CACHE_KEY_CATEGORY_PREFIX}{existingProduct.Category}");
    }

    Console.WriteLine($"🗑️  CACHE INVALIDATED: Product '{existingProduct.Name}' updated");

    return existingProduct;
}
```

**How Change Tracking Works:**
1. FindAsync() loads product into change tracker
2. Modify properties in C# object
3. SaveChangesAsync() compares original vs modified
4. Generates UPDATE with only changed columns

---

## 5. Soft Delete - Logical Delete

**File:** `Services/ProductService.cs` (Line 267-302)

```csharp
public async Task<bool> DeleteProductAsync(int id)
{
    // Load product
    var product = await _context.Products.FindAsync(id);

    // Check exists and not already deleted
    if (product == null || !product.IsActive)
    {
        return false;
    }

    // Soft delete: set IsActive to false instead of DELETE FROM Products
    product.IsActive = false;
    product.UpdatedDate = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    // Generated SQL:
    // UPDATE Products
    // SET IsActive = 0, UpdatedDate = @updated
    // WHERE Id = @id

    // No hard delete - data preserved for audit trail

    // Invalidate caches
    _cache.Remove($"{CACHE_KEY_PRODUCT_PREFIX}{id}");
    _cache.Remove(CACHE_KEY_ALL_PRODUCTS);
    _cache.Remove($"{CACHE_KEY_CATEGORY_PREFIX}{product.Category}");

    Console.WriteLine($"🗑️  CACHE INVALIDATED: Product '{product.Name}' deleted");

    return true;
}
```

**Why Soft Delete?**
- ✅ Preserves audit trail
- ✅ Prevents orphaned references
- ✅ Allows "undelete"
- ✅ Complies with data retention policies
- ⚠️ ALWAYS filter by `IsActive` in WHERE

---

## 6. Stock Update - Atomic Operation

**File:** `Services/ProductService.cs` (Line 304-320)

```csharp
public async Task<bool> UpdateStockAsync(int id, int quantity)
{
    // Load product
    var product = await _context.Products.FindAsync(id);

    if (product == null || !product.IsActive)
    {
        return false;
    }

    // Modify stock
    product.StockQuantity += quantity;  // Increase or decrease
    product.UpdatedDate = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    // Generated SQL:
    // UPDATE Products
    // SET StockQuantity = (StockQuantity + @quantity),
    //     UpdatedDate = @updated
    // WHERE Id = @id

    // Invalidate cache
    _cache.Remove($"{CACHE_KEY_PRODUCT_PREFIX}{id}");
    _cache.Remove(CACHE_KEY_ALL_PRODUCTS);

    return true;
}
```

---

## 7. Configuration & Migrations - Database Schema

**File:** `Data/ProductDbContext.cs` (Line 28-78) - OnModelCreating

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // Configure the Product entity / table mapping
    modelBuilder.Entity<Product>(entity =>
    {
        // Map to Products table
        entity.ToTable("Products");

        // Primary key
        entity.HasKey(p => p.Id);

        // Column configurations
        entity.Property(p => p.Name)
            .IsRequired()                    // NOT NULL
            .HasMaxLength(100)              // VARCHAR(100)
            .HasColumnType("nvarchar(100)");

        entity.Property(p => p.Description)
            .HasMaxLength(500)
            .HasColumnType("nvarchar(500)");

        // Decimal with precision (10 total digits, 2 after decimal)
        entity.Property(p => p.Price)
            .HasPrecision(10, 2);  // SQL: DECIMAL(10,2)

        entity.Property(p => p.StockQuantity)
            .IsRequired();

        entity.Property(p => p.Category)
            .IsRequired()
            .HasMaxLength(50);

        // Timestamp columns with SQL defaults
        entity.Property(p => p.CreatedDate)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");  // SQL Server function

        entity.Property(p => p.UpdatedDate)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes for performance
        entity.HasIndex(p => p.Category).HasDatabaseName("IX_Product_Category");
        entity.HasIndex(p => p.Name).HasDatabaseName("IX_Product_Name");
    });
}
```

**Database Indexes:**
- IX_Product_Category: Fast WHERE Category = @category queries
- IX_Product_Name: Fast WHERE Name LIKE '%...' and ORDER BY Name

**Creating Migrations:**
```bash
# Create initial migration
dotnet ef migrations add InitialCreate --project ProductCatalogAPI-WebAPI-EFCore

# Apply to database
dotnet ef database update --project ProductCatalogAPI-WebAPI-EFCore
```

---

## 8. AsNoTracking() - Performance Optimization

### What It Does
Disables change tracking for read-only queries. Significantly improves performance.

**File:** `Services/ProductService.cs` - used in three read methods

```csharp
// WITH change tracking (default)
var products = await _context.Products
    .Where(p => p.IsActive)
    .ToListAsync();
// EF tracks every entity in change tracker
// Can modify and SaveChangesAsync() will update database

// WITHOUT change tracking (optimized for reads)
var products = await _context.Products
    .Where(p => p.IsActive)
    .AsNoTracking()  // Disable tracking
    .ToListAsync();
// EF doesn't track entities
// Prevents accidental modifications
// ~30% faster performance

// When to use AsNoTracking():
// ✓ All read-only queries (APIs returning data)
// ✓ GraphQL queries (data is usually read-only)
// ✓ Reporting/analytics queries
// ✓ When returning data you won't modify

// When NOT to use:
// ✗ If you need to modify and save changes
// ✗ If you need optimistic concurrency
```

---

## 9. Complex Query Example - Not in Project But Useful

```csharp
// Example: Build dynamic search query
public async Task<List<Product>> SearchAsync(
    string? keyword,
    string? category,
    decimal? minPrice,
    decimal? maxPrice)
{
    // Start with base query
    IQueryable<Product> query = _context.Products
        .Where(p => p.IsActive);

    // Add conditions dynamically
    if (!string.IsNullOrEmpty(keyword))
    {
        query = query.Where(p =>
            p.Name.Contains(keyword) ||
            p.Description.Contains(keyword)
        );
    }

    if (!string.IsNullOrEmpty(category))
    {
        query = query.Where(p => p.Category == category);
    }

    if (minPrice.HasValue)
    {
        query = query.Where(p => p.Price >= minPrice.Value);
    }

    if (maxPrice.HasValue)
    {
        query = query.Where(p => p.Price <= maxPrice.Value);
    }

    // Execute - everything above becomes single SQL query
    return await query
        .OrderBy(p => p.Category)
        .ThenBy(p => p.Name)
        .AsNoTracking()
        .ToListAsync();
}

// Generated SQL (with all parameters):
// SELECT * FROM Products
// WHERE IsActive = 1
//   AND (Name LIKE '%keyword%' OR Description LIKE '%keyword%')
//   AND Category = @category
//   AND Price >= @minPrice
//   AND Price <= @maxPrice
// ORDER BY Category, Name
```

---

## 10. Summary - When to Use Each Approach

| Scenario | Method | Why |
|----------|--------|-----|
| Get by ID | FindAsync() | Fastest, indexed lookup |
| Get all | Where().ToListAsync() | Database filtering |
| Filter results | Where() chains | Build complex queries |
| Read-only | AsNoTracking() | 30% performance boost |
| Create | Add() + SaveChangesAsync() | Automatic ID generation |
| Modify | FindAsync() → modify → SaveChangesAsync() | Change detection |
| Delete | FindAsync() → IsActive=false → SaveChangesAsync() | Soft delete pattern |
| Update stock | FindAsync() → += → SaveChangesAsync() | Atomic at DB |

---

## Best Practices

✅ **DO:**
- Use AsNoTracking() for all read-only queries
- Filter at database level (WHERE) not in-memory
- Invalidate caches when data changes
- Use FindAsync() for single entity by ID
- Build IQueryable queries before materializing

❌ **DON'T:**
- Load all data then filter in-memory
- Call SaveChangesAsync() multiple times per request
- Use FindAsync() for non-ID lookups (use Where instead)
- Skip AsNoTracking() on read queries
- Forget to update IsActive = 1 in WHERE clauses

---

**Next:** See how ADO.NET does the same operations with lower-level control!
