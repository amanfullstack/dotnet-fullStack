# Collections in C# - Practical Guide

## Overview

Collections are containers that hold multiple items of the same type. Understanding different collection types and when to use each is crucial for writing efficient .NET code.

---

## 1. List<T> - The Most Common Collection

### What It Is
`List<T>` is a generic, resizable array-based collection. It's the most commonly used collection type.

### From ProductCatalogAPI Project

**File:** `Services/ProductService.cs` (Line 106-134)

```csharp
public async Task<List<Product>> GetAllProductsAsync()
{
    // Check cache first
    if (_cache.TryGetValue(CACHE_KEY_ALL_PRODUCTS, out List<Product>? cachedProducts))
    {
        Console.WriteLine($"✓ CACHE HIT: GetAllProducts returning {cachedProducts?.Count} products");
        return cachedProducts!;  // Return cached List
    }

    // Query database and convert to List
    var products = await _context.Products
        .Where(p => p.IsActive)
        .OrderBy(p => p.Name)
        .AsNoTracking()
        .ToListAsync();  // IQueryable → List<Product>

    // Cache the list
    var cacheOptions = new MemoryCacheEntryOptions()
        .SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
    _cache.Set(CACHE_KEY_ALL_PRODUCTS, products, cacheOptions);

    return products;
}
```

### Key Characteristics

| Feature | Details |
|---------|---------|
| **Resizable** | Grows/shrinks dynamically |
| **Ordered** | Maintains insertion order |
| **Access** | O(1) random access via index |
| **Memory** | Contiguous allocation |
| **Generic** | Type-safe with `List<T>` |

### When to Use

✅ **Use List<T> when:**
- Need to store multiple items of same type
- Require random access by index
- Know approximate size (List grows efficiently)
- Returning collections from methods
- Caching data

### Example Usage

```csharp
// Creating and using List<T>
List<Product> products = new List<Product>();

// Add items
products.Add(new Product { Id = 1, Name = "Laptop", Price = 999 });

// Access by index
var firstProduct = products[0];

// Iterate
foreach (var product in products)
{
    Console.WriteLine(product.Name);
}

// Count
int count = products.Count;  // O(1) operation

// Clear
products.Clear();
```

### Performance Characteristics

```
Add:            O(1) amortized
Remove:         O(n) - must shift elements
Find by index:  O(1)
Find by value:  O(n)
Contains:       O(n)
```

---

## 2. IEnumerable<T> - The Interface Abstraction

### What It Is
`IEnumerable<T>` is an interface that represents a collection you can iterate over. It doesn't know the underlying implementation (could be List, Array, HashSet, etc.).

### From ProductCatalogAPI Project

**File:** `Controllers/ProductsController.cs` (Line 108-120)

```csharp
[HttpGet]
public async Task<ActionResult<IEnumerable<Product>>> GetAllProducts()
{
    try
    {
        // Service returns List, but we return IEnumerable
        var products = await _productService.GetAllProductsAsync();
        _logger.LogInformation($"Retrieved {products.Count} products");

        return Ok(products);  // List<Product> presented as IEnumerable<Product>
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error retrieving products");
        return StatusCode(500, "Internal server error");
    }
}

public async Task<ActionResult<IEnumerable<Product>>> GetProductsByCategory(string category)
{
    try
    {
        if (string.IsNullOrWhiteSpace(category))
            return BadRequest("Category is required");

        var products = await _productService.GetProductsByCategoryAsync(category);
        return Ok(products);  // Returns IEnumerable abstraction
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error retrieving products by category");
        return StatusCode(500, "Internal server error");
    }
}
```

### Key Characteristics

| Feature | Details |
|---------|---------|
| **Interface** | Abstract contract, not concrete implementation |
| **Iteration** | Only supports forward enumeration |
| **Memory** | Unknown (depends on implementation) |
| **Lazy** | Can represent deferred execution |
| **Flexibility** | Works with any collection type |

### When to Use

✅ **Use IEnumerable<T> when:**
- Returning collections from methods (API contracts)
- Don't care about underlying collection type
- Want flexibility in implementation
- LINQ query results before calling ToList()
- Accepting collections as parameters

### Example Usage

```csharp
// Interface-based programming
public void ProcessProducts(IEnumerable<Product> products)
{
    foreach (var product in products)
    {
        Console.WriteLine(product.Name);
    }
    // Note: Can't access by index, can't Count efficiently without MaterializIng
}

// Can pass List, Array, HashSet, or any IEnumerable<T>
List<Product> productList = new List<Product>();
IEnumerable<Product> enumerable = productList;  // Implicit conversion

Array<Product> productArray = new Product[] { };
enumerable = productArray;  // Still IEnumerable compatible

HashSet<Product> productSet = new HashSet<Product>();
enumerable = productSet;    // All types work
```

### Why It Matters

**Good API Design:**
```csharp
// ✓ GOOD: Returns IEnumerable (implementation-agnostic)
public IEnumerable<Product> GetProducts()
{
    return _context.Products.Where(p => p.IsActive);
}

// ✗ BAD: Exposes List (locks to specific type)
public List<Product> GetProducts()
{
    return _context.Products.Where(p => p.IsActive).ToList();
}
```

---

## 3. IQueryable<T> - Deferred Execution & Database Queries

### What It Is
`IQueryable<T>` represents a query that can be translated to SQL or other data source.  It's deferred execution - the query doesn't run until you call a terminating operator like `ToList()`, `Count()`, `FirstAsync()`, etc.

### From ProductCatalogAPI Project

**File:** `Services/ProductService.cs` (Line 121-125)

```csharp
// IQueryable chain - query not executed yet
var products = await _context.Products
    .Where(p => p.IsActive)          // Still IQueryable
    .OrderBy(p => p.Name)            // Still IQueryable
    .AsNoTracking()                  // Still IQueryable - disables change tracking for perf
    .ToListAsync();                  // NOW executes ALL of above as single SQL query

// Generated SQL (approximately):
// SELECT * FROM Products
// WHERE IsActive = 1
// ORDER BY Name
```

**File:** `Services/ProductService.cs` (Line 202-206)

```csharp
// Complex IQueryable query
var products = await _context.Products
    .Where(p => p.Category == category && p.IsActive)  // Deferred
    .OrderBy(p => p.Name)                             // Deferred
    .AsNoTracking()                                   // Deferred
    .ToListAsync();                                   // Executes NOW

// Generated SQL:
// SELECT * FROM Products
// WHERE Category = @Category AND IsActive = 1
// ORDER BY Name
```

### Key Characteristics

| Feature | Details |
|---------|---------|
| **Deferred** | Query not executed until materialized |
| **Translatable** | Can convert to SQL/other query languages |
| **Composable** | Chain multiple operations before execution |
| **Optimized** | Database applies WHERE, ORDER BY, etc. |
| **Return Value** | IQueryable until you call .ToList(), .FirstAsync(), etc. |

### When to Use

✅ **Use IQueryable<T> when:**
- Working with EF Core / LINQ to SQL
- Building dynamic queries with conditions
- Want database-level filtering (not in-memory)
- Need performance for large datasets
- Query parameters determined at runtime

### Example Usage

```csharp
// Building dynamic queries
public async Task<List<Product>> SearchProducts(string? category, decimal? minPrice, decimal? maxPrice)
{
    // Start with IQueryable - nothing executes yet
    IQueryable<Product> query = _context.Products.Where(p => p.IsActive);

    // Conditionally add filters
    if (!string.IsNullOrEmpty(category))
    {
        query = query.Where(p => p.Category == category);  // Added to SQL
    }

    if (minPrice.HasValue)
    {
        query = query.Where(p => p.Price >= minPrice);     // Added to SQL
    }

    if (maxPrice.HasValue)
    {
        query = query.Where(p => p.Price <= maxPrice);     // Added to SQL
    }

    // Execute NOW - single SQL query with all filters
    return await query.OrderBy(p => p.Name).ToListAsync();
}

// Generated SQL (if all parameters provided):
// SELECT * FROM Products
// WHERE IsActive = 1
//   AND Category = @category
//   AND Price >= @minPrice
//   AND Price <= @maxPrice
// ORDER BY Name
```

---

## 4. IList<T> - Mutable Collection Interface

### What It Is
`IList<T>` is an interface that requires the collection to support adding, removing, and accessing by index.

### Example Usage (Not currently in project, but useful pattern)

```csharp
// ✓ Good practice for methods needing mutability
public void AddProductsToCache(IList<Product> products, Product newProduct)
{
    // IList guarantees we can Add and access by index
    products.Add(newProduct);
    var firstProduct = products[0];
    products.RemoveAt(0);
}

// Can pass List, Array, but NOT IEnumerable or HashSet
List<Product> productList = new List<Product>();
AddProductsToCache(productList, product);  // ✓ Works

// IReadOnlyList<T> - if you don't need modification
public void DisplayProducts(IReadOnlyList<Product> products)
{
    // Can only read and iterate, no modifications
    for (int i = 0; i < products.Count; i++)
    {
        Console.WriteLine(products[i].Name);
    }
}
```

---

## 5. HashSet<T> - Unique Items, Fast Lookup

### What It Is
`HashSet<T>` stores unique items and provides O(1) lookup. No duplicates allowed.

### Example Usage (Not currently in project, but useful for avoiding duplicates)

```csharp
// Get unique categories
var categories = new HashSet<string>();

foreach (var product in products)
{
    categories.Add(product.Category);  // Duplicates automatically ignored
}

// Use cases:
// - Tracking visited items
// - Ensuring uniqueness
// - Fast "contains" checks

// Performance vs List
// List: Contains() = O(n) - must check every item
// HashSet: Contains() = O(1) - direct hash lookup

var categorySet = new HashSet<string> { "Electronics", "Clothing" };
if (categorySet.Contains("Electronics"))  // O(1) - very fast
{
    Console.WriteLine("Found!");
}
```

---

## 6. Dictionary<TKey, TValue> - Key-Value Pairs

### What It Is
`Dictionary<TKey, TValue>` stores key-value pairs with O(1) lookup by key.

### Example Usage (Pattern similar to caching in project)

```csharp
// Similar to what's used in caching mechanism
var productCache = new Dictionary<int, Product>();

// Add items
productCache[1] = new Product { Id = 1, Name = "Laptop" };
productCache[2] = new Product { Id = 2, Name = "Mouse" };

// Lookup - O(1)
if (productCache.TryGetValue(1, out var product))
{
    Console.WriteLine(product.Name);  // Fast
}

// Real example from caching:
// _cache works as Dictionary<string, List<Product>>
if (_cache.TryGetValue("all_products", out var cachedProducts))
{
    return cachedProducts;
}
```

---

## Collection Performance Comparison

```
Operation          List<T>    HashSet<T>    Dictionary<K,V>
Add                O(1)       O(1)          O(1)
Remove             O(n)       O(1)          O(1)
Access by value    O(n)       O(1)          O(1) by key
Contains           O(n)       O(1)          -
Get by index       O(1)       N/A           -
Iterate            O(n)       O(n)          O(n)
Memory overhead    Low        Medium        Medium
```

---

## Collection Selection Guide

| Scenario | Collection | Why |
|----------|-----------|-----|
| Return from API | `IEnumerable<T>` | Flexible, abstraction |
| Store in cache | `List<T>` | Fast, ordered, flexible |
| Database query | `IQueryable<T>` | Deferred, SQL optimized |
| Unique items only | `HashSet<T>` | Automatic deduplication, fast lookup |
| Cache by ID | `Dictionary<int, Product>` | O(1) lookup by key |
| Method parameter | `IEnumerable<T>` or specific type | Depends on needs |

---

## Best Practices

✅ **DO:**
- Use `IEnumerable<T>` for return types (API contracts)
- Use `IQueryable<T>` for EF Core queries
- Use `List<T>` for storing data or caching
- Use `HashSet<T>` when you need unique items
- Use `Dictionary<T>` for key-based lookups

❌ **DON'T:**
- Expose concrete collection types (List) in public APIs
- Use List.Contains() in tight loops (use HashSet instead)
- Call .ToList() too early (let IQueryable optimize)
- Mix collection types unnecessarily

---

## Summary

```
List<T>           → Concrete collection, resizable, indexed
IEnumerable<T>    → Interface, flexible, read-only iteration
IQueryable<T>     → Database queries, deferred execution
HashSet<T>        → Unique items, fast lookup
Dictionary<K,V>   → Key-value pairs, fast lookup by key
```

Choose collections based on your actual needs - List for storage, IEnumerable for flexibility, IQueryable for database queries.
