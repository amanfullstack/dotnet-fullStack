using ProductCatalogAPI.Data;
using ProductCatalogAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ProductCatalogAPI.Services
{
    /// <summary>
    /// IMPORTANT FLOW #3: SERVICE LAYER (Business Logic)
    /// The service layer contains all business logic and is decoupled from the controller.
    /// This makes testing and code reuse easier.
    /// Controllers call these methods instead of directly accessing the database.
    /// </summary>
    public interface IProductService
    {
        // CREATE - Add a new product to the database
        Task<Product> CreateProductAsync(Product product);

        // READ - Get all products
        Task<List<Product>> GetAllProductsAsync();

        // READ - Get single product by ID
        Task<Product?> GetProductByIdAsync(int id);

        // READ - Get products by category
        Task<List<Product>> GetProductsByCategoryAsync(string category);

        // UPDATE - Update an existing product
        Task<Product?> UpdateProductAsync(int id, Product product);

        // DELETE - Delete a product (soft delete - mark as inactive)
        Task<bool> DeleteProductAsync(int id);

        // Additional business logic
        Task<bool> UpdateStockAsync(int id, int quantity);
    }

    public class ProductService : IProductService
    {
        // IMPORTANT: We inject the DbContext through constructor dependency injection
        // This allows for better testing and loose coupling
        private readonly ProductDbContext _context;

        public ProductService(ProductDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// CREATE OPERATION
        /// Flow:
        /// 1. Validate input (in controller, not shown here)
        /// 2. Create new Product object
        /// 3. Add to DbContext
        /// 4. Call SaveChangesAsync to persist to database
        /// 5. Return the created product with ID
        /// </summary>
        public async Task<Product> CreateProductAsync(Product product)
        {
            // Set timestamps
            product.CreatedDate = DateTime.UtcNow;
            product.UpdatedDate = DateTime.UtcNow;
            product.IsActive = true;

            // Add to context (marks as "Added" in change tracker)
            _context.Products.Add(product);

            // SaveChangesAsync triggers INSERT statement in the database
            await _context.SaveChangesAsync();

            return product;
        }

        /// <summary>
        /// READ OPERATION - Get All
        /// Flow:
        /// 1. Query all products that are active (IsActive = true)
        /// 2. Order by name for consistent results
        /// 3. ToListAsync executes the query asynchronously (important for performance)
        /// 4. Return list to caller
        /// NOTE: We filter IsActive here to implement soft delete logic
        /// </summary>
        public async Task<List<Product>> GetAllProductsAsync()
        {
            // IMPORTANT: AsNoTracking() improves performance for read-only queries
            // Change tracker is disabled since we're not modifying these entities
            return await _context.Products
                .Where(p => p.IsActive)
                .OrderBy(p => p.Name)
                .AsNoTracking()
                .ToListAsync();
        }

        /// <summary>
        /// READ OPERATION - Get Single
        /// Flow:
        /// 1. Search by primary key (Id)
        /// 2. Check if active
        /// 3. Return product or null if not found
        /// NOTE: FindAsync uses indexes for fast lookup
        /// </summary>
        public async Task<Product?> GetProductByIdAsync(int id)
        {
            // FindAsync is optimized for primary key lookups
            var product = await _context.Products.FindAsync(id);

            // Return null if not found or if marked as deleted
            if (product == null || !product.IsActive)
            {
                return null;
            }

            return product;
        }

        /// <summary>
        /// READ OPERATION - Filter by Category
        /// Flow:
        /// 1. Filter by category name (uses index for performance)
        /// 2. Filter only active products
        /// 3. Order by name for consistent results
        /// 4. Execute query
        /// </summary>
        public async Task<List<Product>> GetProductsByCategoryAsync(string category)
        {
            return await _context.Products
                .Where(p => p.Category == category && p.IsActive)
                .OrderBy(p => p.Name)
                .AsNoTracking()
                .ToListAsync();
        }

        /// <summary>
        /// UPDATE OPERATION
        /// Flow:
        /// 1. Fetch the existing product from database
        /// 2. Check if found and active
        /// 3. Update all properties with new values
        /// 4. Update the UpdatedDate timestamp
        /// 5. Call SaveChangesAsync to persist changes
        /// NOTE: EF Core tracks changes automatically via change tracker
        /// </summary>
        public async Task<Product?> UpdateProductAsync(int id, Product product)
        {
            // Fetch existing product (this loads it into the change tracker)
            var existingProduct = await _context.Products.FindAsync(id);

            if (existingProduct == null || !existingProduct.IsActive)
            {
                return null;
            }

            // Update properties
            // IMPORTANT: Only update the properties provided, don't overwrite Id and CreatedDate
            existingProduct.Name = product.Name;
            existingProduct.Description = product.Description;
            existingProduct.Price = product.Price;
            existingProduct.StockQuantity = product.StockQuantity;
            existingProduct.Category = product.Category;
            existingProduct.UpdatedDate = DateTime.UtcNow;

            // Mark as modified and save
            // SaveChangesAsync generates UPDATE statement for modified entities
            await _context.SaveChangesAsync();

            return existingProduct;
        }

        /// <summary>
        /// DELETE OPERATION (Soft Delete)
        /// Flow:
        /// 1. Find the product
        /// 2. Check if exists and is active
        /// 3. Mark IsActive = false instead of deleting from database
        /// 4. Update the UpdatedDate
        /// 5. Save changes
        /// NOTE: This is "soft delete" - keeps data for audit purposes
        /// For hard delete, use _context.Products.Remove(product); instead
        /// </summary>
        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null || !product.IsActive)
            {
                return false;
            }

            // Soft delete: mark as inactive
            product.IsActive = false;
            product.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        /// <summary>
        /// UPDATE STOCK OPERATION
        /// Flow:
        /// 1. Find the product
        /// 2. Validate that we have sufficient stock (if decreasing)
        /// 3. Update the StockQuantity
        /// 4. Save changes
        /// Use case: When orders are placed or inventory is adjusted
        /// </summary>
        public async Task<bool> UpdateStockAsync(int id, int quantity)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null || !product.IsActive)
            {
                return false;
            }

            // Validate stock
            if (product.StockQuantity + quantity < 0)
            {
                throw new InvalidOperationException("Insufficient stock");
            }

            // Update stock and timestamp
            product.StockQuantity += quantity;
            product.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
