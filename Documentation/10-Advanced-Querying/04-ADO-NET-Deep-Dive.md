# ADO.NET Deep Dive - Raw SQL Approach from ProductCatalogAPI

## Overview

ADO.NET (ActiveX Data Objects) is the lower-level data access technology. Unlike EF Core, you write SQL directly and manually map results to objects. This provides maximum performance and control but requires more code.

---

## 1. Connection Management - SqlConnection

### What It Is
`SqlConnection` represents a connection to SQL Server database.

### From ProductCatalogAPI Project

**File:** `Services/ProductAdoService.cs` (Line 15-25)

```csharp
public class ProductAdoService : IProductService
{
    private readonly string _connectionString;
    private readonly ILogger<ProductAdoService> _logger;

    // Constructor receives connection string from dependency injection
    public ProductAdoService(
        IConfiguration configuration,
        ILogger<ProductAdoService> logger)
    {
        // Get connection string from appsettings.json
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not configured");
        _logger = logger;
    }
}

// Program.cs registration:
// builder.Services.AddScoped<IProductService, ProductAdoService>();
```

**Key Patterns:**
- Connection string from configuration (secure, no hardcoding)
- Using dependency injection for logger
- Lazy initialization (connection opens when needed)

---

## 1B. Connection Patterns - Closed vs Open Connection

### Closed Connection Pattern (USED IN ProductCatalogAPI) ✅

**What It Is:**
Open connection → Execute command → Close connection immediately. Connection returns to pool.

**From ProductCatalogAPI Project - This is what we use!**

```csharp
// File: Services/ProductAdoService.cs
public async Task<Product?> GetProductByIdAsync(int id)
{
    try
    {
        // 1. Create new connection
        using (SqlConnection conn = new SqlConnection(_connectionString))
        {
            string sql = "SELECT * FROM Products WHERE Id = @Id AND IsActive = 1";
            SqlCommand cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);

            // 2. Open connection
            await conn.OpenAsync();

            // 3. Execute query
            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                if (await reader.ReadAsync())
                {
                    return new Product { ... };
                }
            }
            // 4. Connection automatically closed here (using statement)
        }

        return null;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting product");
        throw;
    }
}

// Timeline:
// T=0ms: new SqlConnection() → Connection state: CLOSED
// T=1ms: OpenAsync() → Connection state: OPEN
// T=5ms: ExecuteReaderAsync() → Query executing
// T=10ms: ReadAsync() → Data returned
// T=11ms: Using block ends → Connection automatically closed, returned to pool
// T=12ms: Ready for next request
```

**Closed Connection Advantages:**
✅ Automatic connection pooling (SqlClient manages pool)
✅ Minimal memory footprint (few open connections)
✅ Scalable to many concurrent users (100+ concurrent requests)
✅ Thread-safe (connection pool is thread-safe)
✅ Works great for web applications (stateless requests)

**Closed Connection Workflow:**
```
Request arrives
    ↓
Open connection from pool (or create new)
    ↓
Execute query
    ↓
Close connection (return to pool)
    ↓
Request completes
```

**When to Use:**
- Web APIs (stateless, one request = one operation)
- ASP.NET Core applications (your ProjectCatalogAPI!)
- Typical CRUD operations
- Most scenarios

---

### Open Connection Pattern (Conceptual - Advanced Scenarios)

**What It Is:**
Keep connection open across multiple operations within a logical batch, then close once.

**Example (Conceptual - Not in ProjectCatalogAPI):**

```csharp
// CONCEPTUAL CODE - Open connection for batch operations
public async Task<bool> ProcessBulkUpdateAsync(List<int> productIds)
{
    // 1. Create and KEEP connection open
    using (SqlConnection conn = new SqlConnection(_connectionString))
    {
        // Open ONCE
        await conn.OpenAsync();

        // 2. Execute MULTIPLE commands on same connection
        foreach (var productId in productIds)
        {
            string sql = "UPDATE Products SET StockQuantity = StockQuantity - 1 WHERE Id = @Id";
            SqlCommand cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@Id", productId);

            // Execute without closing connection
            await cmd.ExecuteNonQueryAsync();
        }

        // 3. Close connection ONCE at end (or use transaction)
    }
    // Connection closed here

    return true;
}

// Timeline:
// T=0ms: new SqlConnection()
// T=1ms: OpenAsync() → Connection STAYS OPEN
// T=2ms: Execute command 1
// T=3ms: Command 1 complete (connection still open!)
// T=4ms: Execute command 2
// T=5ms: Command 2 complete (connection still open!)
// T=6ms: ... more commands ...
// T=50ms: All commands done
// T=51ms: Using block ends → Connection closed, returned to pool
```

**Open Connection with Transaction (Most Common Open Pattern):**

```csharp
// Conceptual code for consistent batch operations
public async Task<bool> TransferStockAsync(int fromProductId, int toProductId, int quantity)
{
    using (SqlConnection conn = new SqlConnection(_connectionString))
    {
        await conn.OpenAsync();

        // START TRANSACTION - All or nothing
        using (SqlTransaction transaction = conn.BeginTransaction())
        {
            try
            {
                // Command 1: Reduce stock in source product
                var cmd1 = new SqlCommand(
                    "UPDATE Products SET StockQuantity = StockQuantity - @Qty WHERE Id = @Id",
                    conn,
                    transaction);
                cmd1.Parameters.AddWithValue("@Qty", quantity);
                cmd1.Parameters.AddWithValue("@Id", fromProductId);
                await cmd1.ExecuteNonQueryAsync();

                // Command 2: Increase stock in target product
                var cmd2 = new SqlCommand(
                    "UPDATE Products SET StockQuantity = StockQuantity + @Qty WHERE Id = @Id",
                    conn,
                    transaction);
                cmd2.Parameters.AddWithValue("@Qty", quantity);
                cmd2.Parameters.AddWithValue("@Id", toProductId);
                await cmd2.ExecuteNonQueryAsync();

                // COMMIT both changes
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                // ROLLBACK if error - both changes are undone
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Transaction failed");
                return false;
            }
        }
        // Connection closed here after transaction
    }
}

// If Command 1 succeeds but Command 2 fails:
// Both are ROLLED BACK (atomicity guaranteed)
```

**Open Connection Advantages:**
✅ Better performance for batch operations (fewer round trips to connection pool)
✅ Transaction support (ACID guarantees)
✅ Consistency across multiple operations
✅ Reduced connection pool contention
✅ All-or-nothing semantics (COMMIT/ROLLBACK)

**Open Connection Disadvantages:**
❌ Connection held longer (ties up pool resource)
❌ Not ideal for web apps (stateless model)
❌ Can cause connection pool exhaustion
❌ Risk of connection timeout if too long

**Comparison Table:**

| Aspect | Closed Connection | Open Connection |
|--------|------------------|-----------------|
| **Connection Lifecycle** | Open → Close per command | Open once, multiple commands |
| **Use Case** | Single query per request | Batch operations, transactions |
| **Performance** | Good for typical requests | Better for 2+ related operations |
| **Pool Efficiency** | Excellent (connections reused) | Can tie up pool resources |
| **Transaction Support** | Limited | Full support (COMMIT/ROLLBACK) |
| **Complexity** | Simple | More complex |
| **Web App Compatibility** | Perfect | Not ideal |
| **Typical Example** | Get single product | Transfer inventory between products |

**When to Use Each:**
```
Use CLOSED CONNECTION:
→ Web APIs (stateless requests)
→ Single operation per request
→ Highest scalability needed
→ Simple CRUD operations
→ Most ASP.NET Core apps

Use OPEN CONNECTION:
→ Batch operations (bulk update)
→ Multi-step transactions
→ Data consistency critical
→ Desktop applications
→ Background jobs/scheduled tasks
→ When fewer concurrent ops needed
```

---

## 2. Reading Data - Various Approaches

### 2.1 Get All Products

**File:** `Services/ProductAdoService.cs` (Line 61-113)

```csharp
public async Task<List<Product>> GetAllProductsAsync()
{
    var products = new List<Product>();  // Manually create collection

    try
    {
        using (SqlConnection conn = new SqlConnection(_connectionString))
        {
            // Write SQL directly
            string sql = @"
                SELECT Id, Name, Description, Price, StockQuantity, Category,
                       CreatedDate, UpdatedDate, IsActive
                FROM Products
                WHERE IsActive = 1
                ORDER BY Name";

            SqlCommand cmd = new SqlCommand(sql, conn);

            await conn.OpenAsync();
            _logger.LogInformation("[ADO.NET] Executing: Get All Products");

            // Execute query and get DataReader
            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                // Iterate through rows
                while (await reader.ReadAsync())
                {
                    // Manually map each column to object
                    var product = new Product
                    {
                        Id = (int)reader["Id"],
                        Name = (string)reader["Name"],
                        Description = reader["Description"] != DBNull.Value
                            ? (string)reader["Description"]
                            : "",
                        Price = (decimal)reader["Price"],
                        StockQuantity = (int)reader["StockQuantity"],
                        Category = (string)reader["Category"],
                        CreatedDate = (DateTime)reader["CreatedDate"],
                        UpdatedDate = (DateTime)reader["UpdatedDate"],
                        IsActive = (bool)reader["IsActive"]
                    };

                    products.Add(product);
                }
            }
        }

        _logger.LogInformation($"[ADO.NET] Retrieved {products.Count} products");
        return products;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "[ADO.NET] Error getting all products");
        throw;
    }
}
```

**Key Points:**
- `using` statement ensures connection closes
- SqlDataReader is fast, forward-only cursor
- Manual mapping: column by column
- Handles DBNull.Value (SQL NULL)
- No change tracking overhead

**Performance:**
- Network: All columns transferred
- CPU: Manual mapping adds overhead
- Memory: Manual collection management
- Suitable for: High-throughput read-only queries

---

### 2.2 Get Product by ID

**File:** `Services/ProductAdoService.cs` (Line 119-166)

```csharp
public async Task<Product?> GetProductByIdAsync(int id)
{
    try
    {
        using (SqlConnection conn = new SqlConnection(_connectionString))
        {
            string sql = @"
                SELECT Id, Name, Description, Price, StockQuantity, Category,
                       CreatedDate, UpdatedDate, IsActive
                FROM Products
                WHERE Id = @Id AND IsActive = 1";

            SqlCommand cmd = new SqlCommand(sql, conn);

            // CRITICAL: Use parameters to prevent SQL injection
            // @Id is a placeholder, parameter value set separately
            cmd.Parameters.AddWithValue("@Id", id);

            await conn.OpenAsync();
            _logger.LogInformation($"[ADO.NET] Getting product: {id}");

            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                // Check if row exists
                if (await reader.ReadAsync())
                {
                    return new Product
                    {
                        Id = (int)reader["Id"],
                        Name = (string)reader["Name"],
                        Description = reader["Description"] != DBNull.Value
                            ? (string)reader["Description"]
                            : "",
                        Price = (decimal)reader["Price"],
                        StockQuantity = (int)reader["StockQuantity"],
                        Category = (string)reader["Category"],
                        CreatedDate = (DateTime)reader["CreatedDate"],
                        UpdatedDate = (DateTime)reader["UpdatedDate"],
                        IsActive = (bool)reader["IsActive"]
                    };
                }
            }
        }

        return null;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"[ADO.NET] Error getting product by ID: {id}");
        throw;
    }
}

// Generated SQL sent to server:
// SELECT ... FROM Products
// WHERE Id = @Id AND IsActive = 1
//
// Separately: @Id = 5
// Server receives them separately, preventing injection
```

**SQL Injection Prevention:**
```csharp
// ✗ DANGEROUS - SQL injection vulnerable
string sql = $"WHERE Id = {id}";  // If id = "1 OR 1=1"
// Results in: WHERE Id = 1 OR 1=1  (returns ALL rows!)

// ✓ SAFE - parameterized
commandParameters.AddWithValue("@Id", id);
// Value is separate from SQL, database escapes it
```

---

### 2.3 Filter by Category

**File:** `Services/ProductAdoService.cs` (Line 171-219)

```csharp
public async Task<List<Product>> GetProductsByCategoryAsync(string category)
{
    var products = new List<Product>();

    try
    {
        using (SqlConnection conn = new SqlConnection(_connectionString))
        {
            string sql = @"
                SELECT Id, Name, Description, Price, StockQuantity, Category,
                       CreatedDate, UpdatedDate, IsActive
                FROM Products
                WHERE Category = @Category AND IsActive = 1
                ORDER BY Name";

            SqlCommand cmd = new SqlCommand(sql, conn);

            // Parameter for category filter
            cmd.Parameters.AddWithValue("@Category", category);

            await conn.OpenAsync();
            _logger.LogInformation($"[ADO.NET] Getting products in category: {category}");

            using(SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    products.Add(new Product
                    {
                        Id = (int)reader["Id"],
                        Name = (string)reader["Name"],
                        Description = reader["Description"] != DBNull.Value
                            ? (string)reader["Description"]
                            : "",
                        Price = (decimal)reader["Price"],
                        StockQuantity = (int)reader["StockQuantity"],
                        Category = (string)reader["Category"],
                        CreatedDate = (DateTime)reader["CreatedDate"],
                        UpdatedDate = (DateTime)reader["UpdatedDate"],
                        IsActive = (bool)reader["IsActive"]
                    });
                }
            }
        }

        return products;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"[ADO.NET] Error getting products by category: {category}");
        throw;
    }
}
```

---

## 3. Creating Data - INSERT

**File:** `Services/ProductAdoService.cs` (Line 225-270)

```csharp
public async Task<Product> CreateProductAsync(Product product)
{
    try
    {
        using (SqlConnection conn = new SqlConnection(_connectionString))
        {
            // INSERT statement + SELECT SCOPE_IDENTITY() to get generated ID
            string sql = @"
                INSERT INTO Products
                (Name, Description, Price, StockQuantity, Category, CreatedDate, UpdatedDate, IsActive)
                VALUES
                (@Name, @Description, @Price, @StockQuantity, @Category, @CreatedDate, @UpdatedDate, @IsActive);
                SELECT SCOPE_IDENTITY();";  // Returns the newly inserted ID

            SqlCommand cmd = new SqlCommand(sql, conn);

            // Add parameter for each column
            cmd.Parameters.AddWithValue("@Name", product.Name);
            cmd.Parameters.AddWithValue("@Description", product.Description ?? "");
            cmd.Parameters.AddWithValue("@Price", product.Price);
            cmd.Parameters.AddWithValue("@StockQuantity", product.StockQuantity);
            cmd.Parameters.AddWithValue("@Category", product.Category);
            cmd.Parameters.AddWithValue("@CreatedDate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@UpdatedDate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@IsActive", true);

            await conn.OpenAsync();
            _logger.LogInformation($"[ADO.NET] Creating product: {product.Name}");

            // ExecuteScalarAsync returns single value (SCOPE_IDENTITY result)
            var result = await cmd.ExecuteScalarAsync();
            if (result != null)
            {
                product.Id = Convert.ToInt32(result);  // Set ID from database
                product.CreatedDate = DateTime.UtcNow;
                product.UpdatedDate = DateTime.UtcNow;
                product.IsActive = true;
            }
        }

        return product;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "[ADO.NET] Error creating product");
        throw;
    }
}

// Generated SQL:
// INSERT INTO Products (Name, Description, Price, ...)
// VALUES (@Name, @Description, @Price, ...)
// SELECT SCOPE_IDENTITY()
//
// Returns: 5 (the newly created ID)
```

**Key Points:**
- SCOPE_IDENTITY() gets the auto-generated ID
- All parameters are safe from SQL injection
- Manual object construction
- No automatic timestamp handling

---

## 4. Updating Data - UPDATE

**File:** `Services/ProductAdoService.cs` (Line 275-320)

```csharp
public async Task<Product?> UpdateProductAsync(int id, Product product)
{
    try
    {
        using (SqlConnection conn = new SqlConnection(_connectionString))
        {
            string sql = @"
                UPDATE Products
                SET Name = @Name,
                    Description = @Description,
                    Price = @Price,
                    StockQuantity = @StockQuantity,
                    Category = @Category,
                    UpdatedDate = @UpdatedDate
                WHERE Id = @Id AND IsActive = 1;
                SELECT @@ROWCOUNT;";  // Returns # of rows affected

            SqlCommand cmd = new SqlCommand(sql, conn);

            // Add parameters for every value
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.Parameters.AddWithValue("@Name", product.Name);
            cmd.Parameters.AddWithValue("@Description", product.Description ?? "");
            cmd.Parameters.AddWithValue("@Price", product.Price);
            cmd.Parameters.AddWithValue("@StockQuantity", product.StockQuantity);
            cmd.Parameters.AddWithValue("@Category", product.Category);
            cmd.Parameters.AddWithValue("@UpdatedDate", DateTime.UtcNow);

            await conn.OpenAsync();
            _logger.LogInformation($"[ADO.NET] Updating product: {id}");

            // ExecuteScalarAsync returns @@ROWCOUNT (rows affected)
            var rowsAffected = await cmd.ExecuteScalarAsync();
            if (rowsAffected != null && (int)rowsAffected > 0)
            {
                product.Id = id;
                product.UpdatedDate = DateTime.UtcNow;
                return product;
            }
        }

        return null;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"[ADO.NET] Error updating product: {id}");
        throw;
    }
}

// @@ROWCOUNT = 1  means update succeeded
// @@ROWCOUNT = 0  means no rows matched (product not found or already deleted)
```

**Soft Delete Pattern Check:**
```csharp
// WHERE IsActive = 1 ensures we only update active products
// Deleted products can't be modified
WHERE Id = @Id AND IsActive = 1;
```

---

## 5. Soft Delete - Logical Delete

**File:** `Services/ProductAdoService.cs` (Line 325-354)

```csharp
public async Task<bool> DeleteProductAsync(int id)
{
    try
    {
        using (SqlConnection conn = new SqlConnection(_connectionString))
        {
            string sql = @"
                UPDATE Products
                SET IsActive = 0,
                    UpdatedDate = @UpdatedDate
                WHERE Id = @Id AND IsActive = 1;
                SELECT @@ROWCOUNT;";

            SqlCommand cmd = new SqlCommand(sql, conn);

            cmd.Parameters.AddWithValue("@Id", id);
            cmd.Parameters.AddWithValue("@UpdatedDate", DateTime.UtcNow);

            await conn.OpenAsync();
            _logger.LogInformation($"[ADO.NET] Deleting product: {id}");

            var rowsAffected = await cmd.ExecuteScalarAsync();

            // Success: @@ROWCOUNT = 1
            // Failure: @@ROWCOUNT = 0 (not found or already deleted)
            return rowsAffected != null && (int)rowsAffected > 0;
        }
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"[ADO.NET] Error deleting product: {id}");
        throw;
    }
}

// UPDATE Products
// SET IsActive = 0, UpdatedDate = @UpdatedDate
// WHERE Id = @Id AND IsActive = 1
//
// No data loss, product still in database
```

---

## 6. Stock Update - Atomic at Database Level

**File:** `Services/ProductAdoService.cs` (Line 359-389)

```csharp
public async Task<bool> UpdateStockAsync(int id, int quantity)
{
    try
    {
        using (SqlConnection conn = new SqlConnection(_connectionString))
        {
            string sql = @"
                UPDATE Products
                SET StockQuantity = StockQuantity + @Quantity,
                    UpdatedDate = @UpdatedDate
                WHERE Id = @Id AND IsActive = 1;
                SELECT @@ROWCOUNT;";

            SqlCommand cmd = new SqlCommand(sql, conn);

            cmd.Parameters.AddWithValue("@Id", id);
            cmd.Parameters.AddWithValue("@Quantity", quantity);
            cmd.Parameters.AddWithValue("@UpdatedDate", DateTime.UtcNow);

            await conn.OpenAsync();
            _logger.LogInformation($"[ADO.NET] Updating stock for product: {id} by {quantity}");

            var rowsAffected = await cmd.ExecuteScalarAsync();
            return rowsAffected != null && (int)rowsAffected > 0;
        }
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"[ADO.NET] Error updating stock: {id}");
        throw;
    }
}

// KEY: StockQuantity = StockQuantity + @Quantity
// Calculation happens IN DATABASE
// No fetch-modify-save cycle needed
// Thread-safe: database serializes updates
```

**Why This Matters for Inventory:**
```
Scenario: Two orders at same time, each taking 5 items
Initial stock: 10

Without atomic DB calculation:
- Order1: Fetch (10), set to (10-5=5), save
- Order2: Fetch (10), set to (10-5=5), save
- Result: Both orders processed, stock = 5 (WRONG! Should be 0)

With atomic DB calculation:
- Order1: StockQuantity = StockQuantity + (-5)  → 5
- Order2: StockQuantity = StockQuantity + (-5)  → 0
- Result: Correct stock = 0, both orders counted
```

---

## 7. Error Handling Pattern

**Used Throughout ADO.NET Service:**

```csharp
// Pattern used in every method
try
{
    using (SqlConnection conn = new SqlConnection(_connectionString))
    {
        // ... database operation ...
    }
}
catch (Exception ex)
{
    _logger.LogError(ex, "[ADO.NET] Error doing something");
    throw;  // Re-throw so caller knows operation failed
}

// Error types you might catch:
// SqlException: Database/connection errors
// TimeoutException: Query took too long
// IOException: Network issues
```

---

## 8. Comparison: ADO.NET vs EF Core

| Aspect | ADO.NET | EF Core |
|--------|---------|---------|
| **SQL Writing** | Manual | LINQ expressions |
| **Boilerplate** | High (manual mapping) | Low (automatic) |
| **Performance** | Fastest (direct SQL) | Good (optimized) |
| **Learning Curve** | Moderate | Steep |
| **Type Safety** | Method-level | Compile-time |
| **Query Optimization** | Manual tuning | Automatic |
| **Change Tracking** | Manual | Automatic |
| **Transactions** | Manual | Automatic |
| **Lazy Loading** | N/A | Built-in |
| **Use Case** | High-performance | General CRUD |

---

## ADO.NET Pattern Template

```csharp
// Repeat this pattern for each operation:

public async Task<ResultType> OperationAsync(parameters)
{
    try
    {
        using (SqlConnection conn = new SqlConnection(_connectionString))
        {
            string sql = @"
                -- Your SQL statement
                SELECT/INSERT/UPDATE/DELETE
                ...";

            SqlCommand cmd = new SqlCommand(sql, conn);

            // Add parameters
            cmd.Parameters.AddWithValue("@ParamName", paramValue);

            await conn.OpenAsync();
            _logger.LogInformation($"[ADO.NET] Doing something");

            // Execute: ExecuteReaderAsync, ExecuteScalarAsync, ExecuteNonQueryAsync
            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    // Manual mapping
                }
            }
        }

        return result;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "[ADO.NET] Error doing something");
        throw;
    }
}
```

---

## Best Practices for ADO.NET

✅ **DO:**
- Always use parameters (@name) to prevent SQL injection
- Use `using` statements for connections, commands, readers
- Log operations for debugging
- Handle DBNull.Value explicitly
- Use appropriate ExecuteMethod (Reader, Scalar, NonQuery)

❌ **DON'T:**
- Concatenate parameters into SQL strings
- Leave connections open
- Catch and swallow exceptions
- Hardcode connection strings
- Use SqlDataReader outside using block

---

**Next:** Performance comparison: EF Core vs ADO.NET vs GraphQL!
