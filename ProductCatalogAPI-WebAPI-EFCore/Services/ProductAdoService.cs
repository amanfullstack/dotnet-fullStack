using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using ProductCatalogAPI.Models;

namespace ProductCatalogAPI.Services
{
    /// <summary>
    /// ADO.NET Service - Raw SQL Approach
    ///
    /// IMPORTANT FLOW:
    /// 1. Open connection to database
    /// 2. Create SQL command with parameterized queries (prevent SQL injection)
    /// 3. Execute command
    /// 4. Read results using SqlDataReader
    /// 5. Manually map database rows to C# objects
    /// 6. Close connection
    ///
    /// Advantages: Maximum performance, full control over SQL
    /// Disadvantages: Manual mapping, tedious code, no type safety
    ///
    /// Performance: ⭐⭐⭐⭐⭐ (Fastest - direct SQL execution)
    /// Complexity: ⭐⭐ (Simple - just SQL)
    /// Maintainability: ⭐⭐ (Hard - lots of manual mapping)
    /// </summary>
    public interface IProductAdoService
    {
        Task<List<Product>> GetAllProductsAsync();
        Task<Product?> GetProductByIdAsync(int id);
        Task<List<Product>> GetProductsByCategoryAsync(string category);
        Task<Product> CreateProductAsync(Product product);
        Task<Product?> UpdateProductAsync(int id, Product product);
        Task<bool> DeleteProductAsync(int id);
        Task<bool> UpdateStockAsync(int id, int quantity);
    }

    public class ProductAdoService : IProductAdoService
    {
        private readonly string _connectionString;
        private readonly ILogger<ProductAdoService> _logger;

        public ProductAdoService(IConfiguration configuration, ILogger<ProductAdoService> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? "Server=(localdb)\\mssqllocaldb;Database=ProductCatalogDB;Trusted_Connection=true;";
            _logger = logger;
        }

        /// <summary>
        /// READ ALL - Get all active products
        /// Flow:
        /// 1. Open SQL connection
        /// 2. Execute SELECT query
        /// 3. Read each row from SqlDataReader
        /// 4. Manually map column values to Product object
        /// 5. Add to list
        /// 6. Return list
        /// </summary>
        public async Task<List<Product>> GetAllProductsAsync()
        {
            var products = new List<Product>();

            try
            {
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    // IMPORTANT: Use parameterized queries to prevent SQL injection
                    string sql = @"
                        SELECT Id, Name, Description, Price, StockQuantity, Category,
                               CreatedDate, UpdatedDate, IsActive
                        FROM Products
                        WHERE IsActive = 1
                        ORDER BY Name";

                    SqlCommand cmd = new SqlCommand(sql, conn);

                    await conn.OpenAsync();
                    _logger.LogInformation("[ADO.NET] Executing: Get All Products");

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            // IMPORTANT: Manually map each column to object properties
                            var product = new Product
                            {
                                Id = (int)reader["Id"],
                                Name = (string)reader["Name"],
                                Description = reader["Description"] != DBNull.Value ? (string)reader["Description"] : "",
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

        /// <summary>
        /// READ SINGLE - Get product by ID
        /// Uses parameterized query: @Id parameter
        /// </summary>
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

                    // IMPORTANT: Always use parameters, never string concatenation!
                    cmd.Parameters.AddWithValue("@Id", id);

                    await conn.OpenAsync();
                    _logger.LogInformation($"[ADO.NET] Getting product: {id}");

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new Product
                            {
                                Id = (int)reader["Id"],
                                Name = (string)reader["Name"],
                                Description = reader["Description"] != DBNull.Value ? (string)reader["Description"] : "",
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

        /// <summary>
        /// READ BY CATEGORY - Filter products by category
        /// </summary>
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
                    cmd.Parameters.AddWithValue("@Category", category);

                    await conn.OpenAsync();
                    _logger.LogInformation($"[ADO.NET] Getting products in category: {category}");

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            products.Add(new Product
                            {
                                Id = (int)reader["Id"],
                                Name = (string)reader["Name"],
                                Description = reader["Description"] != DBNull.Value ? (string)reader["Description"] : "",
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

        /// <summary>
        /// CREATE - Insert new product using INSERT statement
        /// IMPORTANT: Get the identity value back using SCOPE_IDENTITY()
        /// </summary>
        public async Task<Product> CreateProductAsync(Product product)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    string sql = @"
                        INSERT INTO Products
                        (Name, Description, Price, StockQuantity, Category, CreatedDate, UpdatedDate, IsActive)
                        VALUES
                        (@Name, @Description, @Price, @StockQuantity, @Category, @CreatedDate, @UpdatedDate, @IsActive);
                        SELECT SCOPE_IDENTITY();";  // Get the ID of inserted row

                    SqlCommand cmd = new SqlCommand(sql, conn);

                    // IMPORTANT: Add all parameters to prevent SQL injection
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

                    var result = await cmd.ExecuteScalarAsync();
                    if (result != null)
                    {
                        product.Id = Convert.ToInt32(result);
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

        /// <summary>
        /// UPDATE - Modify existing product
        /// </summary>
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
                        SELECT @@ROWCOUNT;";  // Returns number of rows affected

                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.Parameters.AddWithValue("@Id", id);
                    cmd.Parameters.AddWithValue("@Name", product.Name);
                    cmd.Parameters.AddWithValue("@Description", product.Description ?? "");
                    cmd.Parameters.AddWithValue("@Price", product.Price);
                    cmd.Parameters.AddWithValue("@StockQuantity", product.StockQuantity);
                    cmd.Parameters.AddWithValue("@Category", product.Category);
                    cmd.Parameters.AddWithValue("@UpdatedDate", DateTime.UtcNow);

                    await conn.OpenAsync();
                    _logger.LogInformation($"[ADO.NET] Updating product: {id}");

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

        /// <summary>
        /// DELETE - Soft delete (mark as inactive)
        /// </summary>
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
                    return rowsAffected != null && (int)rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[ADO.NET] Error deleting product: {id}");
                throw;
            }
        }

        /// <summary>
        /// UPDATE STOCK - Adjust stock quantity
        /// </summary>
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
    }
}
