# LINQ Joins and Advanced Filtering - Practical Guide

## Overview

LINQ provides powerful methods to filter, join, and transform data. This guide covers filtering, ordering, and join patterns used in real applications.

---

## 1. WHERE - Basic Filtering

### From ProductCatalogAPI Project

**File:** `Services/ProductService.cs` (Line 121-125)

```csharp
// Simple WHERE - filter by active status
var products = await _context.Products
    .Where(p => p.IsActive)  // WHERE IsActive = 1
    .OrderBy(p => p.Name)
    .AsNoTracking()
    .ToListAsync();
```

**File:** `Services/ProductService.cs` (Line 202-206)

```csharp
// WHERE with multiple conditions (AND)
var products = await _context.Products
    .Where(p => p.Category == category && p.IsActive)
    .OrderBy(p => p.Name)
    .AsNoTracking()
    .ToListAsync();

// Generated SQL:
// WHERE Category = @Category AND IsActive = 1
```

### Key Concepts

| Operator | SQL Equivalent | Usage |
|----------|---|---|
| `&&` (AND) | AND | Both conditions must be true |
| `\|\|` (OR) | OR | Either condition must be true |
| `!` (NOT) | NOT | Negates condition |

### Example Usage

```csharp
// Single condition
.Where(p => p.Price > 100)
// WHERE Price > 100

// Multiple AND conditions
.Where(p => p.Price > 100 && p.StockQuantity > 0)
// WHERE Price > 100 AND StockQuantity > 0

// OR conditions
.Where(p => p.Category == "Electronics" || p.Category == "Computers")
// WHERE Category = 'Electronics' OR Category = 'Computers'

// NOT condition
.Where(p => !p.IsActive)
// WHERE IsActive = 0

// String operations
.Where(p => p.Name.Contains("Pro"))
// WHERE Name LIKE '%Pro%'

.Where(p => p.Name.StartsWith("Dell"))
// WHERE Name LIKE 'Dell%'

.Where(p => p.Name.EndsWith("Plus"))
// WHERE Name LIKE '%Plus'

// Range conditions
.Where(p => p.Price >= 100 && p.Price <= 1000)
// WHERE Price >= 100 AND Price <= 1000

// Collection Contains (IN clause)
var categoryList = new[] { "Electronics", "Computers", "Phones" };
.Where(p => categoryList.Contains(p.Category))
// WHERE Category IN ('Electronics', 'Computers', 'Phones')

// Null checks
.Where(p => p.Description != null)
// WHERE Description IS NOT NULL
```

---

## 2. ORDER BY - Sorting

### From Project

**File:** `Services/ProductService.cs` (Line 124)

```csharp
.OrderBy(p => p.Name)
// ORDER BY Name ASC
```

**File:** `GraphQL/ProductQuery.cs` (Line 92)

```csharp
// Descending order in GraphQL query
return allProducts
    .Where(p => p.StockQuantity <= threshold)
    .OrderBy(p => p.StockQuantity)  // Ascending
    .ToList();
```

### OrderBy vs OrderByDescending

```csharp
// Ascending order (default)
.OrderBy(p => p.Price)
// ORDER BY Price ASC

// Descending order
.OrderByDescending(p => p.Price)
// ORDER BY Price DESC

// Multiple sorts (primary then secondary)
.OrderBy(p => p.Category)
    .ThenBy(p => p.Price)
// ORDER BY Category ASC, Price ASC

// Mix ascending and descending
.OrderBy(p => p.Category)
    .ThenByDescending(p => p.Price)
// ORDER BY Category ASC, Price DESC

// Complex ordering - useful for UI display
var products = await _context.Products
    .Where(p => p.IsActive)
    .OrderBy(p => p.Category)      // Group by category
    .ThenByDescending(p => p.Price) // Then most expensive first
    .ToListAsync();
```

---

## 3. SELECT - Projection (Transforming Data)

### What It Does
`Select()` transforms each item into a different shape. Only relevant when returning different data than stored.

### Example Usage (Not in current code, but important pattern)

```csharp
// Project to simpler object - fewer columns transferred
var productNames = await _context.Products
    .Where(p => p.IsActive)
    .Select(p => p.Name)  // Only return Name column
    .ToListAsync();
// Generated SQL: SELECT Name FROM Products WHERE IsActive = 1

// Project to anonymous object - useful for APIs
var productSummaries = await _context.Products
    .Where(p => p.IsActive)
    .Select(p => new
    {
        p.Id,
        p.Name,
        p.Price  // Only these 3 columns
    })
    .ToListAsync();
// Generated SQL: SELECT Id, Name, Price FROM Products WHERE IsActive = 1

// Complex projection - calculate derived fields
var productStats = await _context.Products
    .Where(p => p.IsActive)
    .Select(p => new
    {
        p.Id,
        p.Name,
        DiscountedPrice = p.Price * 0.9m,  // Calculate in query
        StockStatus = p.StockQuantity > 0 ? "In Stock" : "Out of Stock"
    })
    .ToListAsync();
// Calculated in database, not in-memory

// When projection is really useful:
// - Network transfer: Only columns needed
// - Database: Calculations at source
// - Performance: Filter before projecting
```

---

## 4. GROUP BY - Grouping Data

### What It Does
`GroupBy()` groups items by a key and allows aggregation.

### Example Usage (Not in current code, but powerful pattern)

```csharp
// Group products by category
var productsByCategory = await _context.Products
    .Where(p => p.IsActive)
    .GroupBy(p => p.Category)
    .Select(g => new
    {
        Category = g.Key,
        Count = g.Count(),
        AveragePrice = g.Average(p => p.Price),
        TotalInventory = g.Sum(p => p.StockQuantity)
    })
    .ToListAsync();

// Generated SQL (complex query):
// SELECT Category, COUNT(*), AVG(Price), SUM(StockQuantity)
// FROM Products
// WHERE IsActive = 1
// GROUP BY Category

// Real example - category report
var categoryReport = await _context.Products
    .Where(p => p.IsActive)
    .GroupBy(p => p.Category)
    .Select(g => new CategoryStats
    {
        Name = g.Key,
        ProductCount = g.Count(),
        LowestPrice = g.Min(p => p.Price),
        HighestPrice = g.Max(p => p.Price),
        AveragePrice = g.Average(p => p.Price)
    })
    .OrderByDescending(c => c.ProductCount)
    .ToListAsync();

// Aggregation functions available:
// g.Count()              - number of items
// g.Sum(p => p.Price)    - total price
// g.Average(p => p.Price) - average price
// g.Min(p => p.Price)    - minimum price
// g.Max(p => p.Price)    - maximum price
// g.First()              - first item in group
// g.Last()               - last item in group
```

---

## 5. DISTINCT - Remove Duplicates

### What It Does
`Distinct()` removes duplicate items from results.

### Example Usage (Not in current code, but useful)

```csharp
// Get unique categories
var uniqueCategories = await _context.Products
    .Where(p => p.IsActive)
    .Select(p => p.Category)
    .Distinct()  // Remove duplicate category names
    .OrderBy(c => c)
    .ToListAsync();

// Generated SQL:
// SELECT DISTINCT Category
// FROM Products
// WHERE IsActive = 1
// ORDER BY Category

// Distinct on complex objects requires IEqualityComparer
// (Usually better to use GroupBy instead for complex scenarios)
```

---

## 6. JOIN Patterns - Combining Tables

### IMPORTANT: Current Project Structure

The ProductCatalogAPI currently stores **Category as string** in Products table (not separate table), so traditional JOIN patterns aren't needed. However, here's how joins WOULD work if we had related tables:

---

### Pattern 1: INNER JOIN (Explicit)

### Conceptual Example (If we had Categories table)

```csharp
// Inner Join - only products with matching category
var productsWithDetails = await (from product in _context.Products
                                   join category in _context.Categories
                                   on product.CategoryId equals category.Id
                                   where product.IsActive && category.IsActive
                                   select new
                                   {
                                       product.Id,
                                       product.Name,
                                       product.Price,
                                       CategoryName = category.Name
                                   })
    .ToListAsync();

// Fluent syntax equivalent:
var productsWithDetails = await _context.Products
    .Where(p => p.IsActive)
    .Join(
        _context.Categories.Where(c => c.IsActive),
        p => p.CategoryId,
        c => c.Id,
        (p, c) => new
        {
            p.Id,
            p.Name,
            p.Price,
            CategoryName = c.Name
        }
    )
    .ToListAsync();

// Generated SQL:
// SELECT p.Id, p.Name, p.Price, c.Name as CategoryName
// FROM Products p
// INNER JOIN Categories c ON p.CategoryId = c.Id
// WHERE p.IsActive = 1 AND c.IsActive = 1
```

---

### Pattern 2: LEFT JOIN (Outer Join)

### Conceptual Example

```csharp
// Left Join - all products, even if category doesn't exist/deleted
var allProducts = await (from product in _context.Products
                          join category in _context.Categories
                          on product.CategoryId equals category.Id
                          into categoryJoin  // Outer join
                          from category in categoryJoin.DefaultIfEmpty()
                          where product.IsActive
                          select new
                          {
                              product.Id,
                              product.Name,
                              CategoryName = category.Name ?? "Uncategorized"
                          })
    .ToListAsync();

// Fluent syntax (GroupJoin for left join):
var allProducts = await _context.Products
    .Where(p => p.IsActive)
    .GroupJoin(
        _context.Categories,
        p => p.CategoryId,
        c => c.Id,
        (p, categories) => new
        {
            p.Id,
            p.Name,
            CategoryName = categories.FirstOrDefault()?.Name ?? "Uncategorized"
        }
    )
    .ToListAsync();

// Generated SQL:
// SELECT p.Id, p.Name, c.Name as CategoryName
// FROM Products p
// LEFT JOIN Categories c ON p.CategoryId = c.Id
// WHERE p.IsActive = 1
```

---

### Pattern 3: GROUP JOIN (One-to-Many)

### Conceptual Example (If Categories had many Products)

```csharp
// Group Join - categories with all their products
var categoriesWithProducts = await _context.Categories
    .GroupJoin(
        _context.Products.Where(p => p.IsActive),
        c => c.Id,
        p => p.CategoryId,
        (category, products) => new
        {
            Category = category.Name,
            ProductCount = products.Count(),
            Products = products.Select(p => p.Name).ToList()
        }
    )
    .ToListAsync();

// Generated SQL behavior:
// SELECT c.Id, c.Name, COUNT(p.Id), p.Name
// FROM Categories c
// LEFT JOIN Products p ON c.Id = p.CategoryId
// GROUP BY c.Id, c.Name
```

---

## 7. Why No Joins in Current Project?

The ProductCatalogAPI stores Category as **string** directly in Products table:

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string Category { get; set; }  // ← String, not foreign key
    public bool IsActive { get; set; }
    // ...
}
```

This is a **simplification for learning** - real systems often have:
- Separate Category/Supplier/Brand tables
- Foreign key relationships
- JOIN-heavy queries

---

## 8. LINQ Method Chaining Order (Best Practices)

```csharp
// Optimal order for performance:
var results = await _context.Products
    .Where(p => p.IsActive)          // 1. Filter at source
    .Where(p => p.Price > 100)       // 2. More filters
    .OrderBy(p => p.Category)        // 3. Sort
    .ThenBy(p => p.Price)            // 4. Secondary sort
    .AsNoTracking()                  // 5. Disable tracking
    .Select(p => new { p.Id, p.Name }) // 6. Project columns
    .ToListAsync();                  // 7. Execute

// Why this order?
// 1-2: Reduce rows early (less data transferred)
// 3-4: Sort at database level
// 5: Disable tracking for performance
// 6: Project only needed columns
// 7: Execute the optimized query
```

---

## Summary: When to Use What

| Method | Purpose | Returns | Use When |
|--------|---------|---------|----------|
| `Where()` | Filter | IQueryable | Reducing dataset |
| `Select()` | Transform | IQueryable | Changing shape |
| `OrderBy()` | Sort ascending | IQueryable | Ordering results |
| `OrderByDescending()` | Sort descending | IQueryable | Reverse order |
| `GroupBy()` | Group by key | IQueryable | Aggregating data |
| `Distinct()` | Remove duplicates | IQueryable | Unique values |
| `Join()` | Inner join | IQueryable | Combining tables |
| `GroupJoin()` | Left join | IQueryable | One-to-many |
| `First()` | Get first | T | Single item expected |
| `FirstOrDefault()` | Get first or null | T? | Single item, may not exist |
| `Take()` | Limit rows | IQueryable | Pagination |
| `Skip()` | Skip rows | IQueryable | Pagination offset |

---

## Best Practices

✅ **DO:**
- Filter with WHERE before SELECT (reduce data)
- Use AsNoTracking() for read-only queries
- Build queries as IQueryable until you need results
- Use primitive projections (Select Id, Name) when possible
- Order at database level, not in-memory

❌ **DON'T:**
- Project early (Select before Where)
- Use .ToList() multiple times in chain
- Filter in-memory (load all, then filter)
- Use joins when simple string comparison works
- Iterate IQueryable multiple times

---

**Next:** Learn how EF Core executes these queries and ADO.NET alternatives!
