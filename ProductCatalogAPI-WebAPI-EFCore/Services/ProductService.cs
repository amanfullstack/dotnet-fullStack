using ProductCatalogAPI.Data;
using ProductCatalogAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ProductCatalogAPI.Services
{
    /// <summary>
    /// IMPORTANT FLOW #3: SERVICE LAYER (Business Logic)
    /// The service layer contains all business logic and is decoupled from the controller.
    /// This makes testing and code reuse easier.
    /// Controllers call these methods instead of directly accessing the database.
    ///
    /// CACHING FLOW:
    /// 1. Check if data exists in cache
    /// 2. If yes (cache hit): return cached data immediately
    /// 3. If no (cache miss): fetch from database
    /// 4. Store in cache for future requests
    /// 5. Return data to caller
    /// 6. On create/update/delete: invalidate relevant cache
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
        private readonly IMemoryCache _cache;

        // Cache key constants
        private const string CACHE_KEY_ALL_PRODUCTS = "products-all";
        private const string CACHE_KEY_PRODUCT_PREFIX = "product-";
        private const string CACHE_KEY_CATEGORY_PREFIX = "products-category-";
        private const int CACHE_DURATION_MINUTES = 5;

        public ProductService(ProductDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        /// <summary>
        /// CREATE OPERATION (WITH CACHE INVALIDATION)
        /// Flow:
        /// 1. Validate input (in controller, not shown here)
        /// 2. Create new Product object
        /// 3. Add to DbContext
        /// 4. Call SaveChangesAsync to persist to database
        /// 5. Invalidate cache - product list changed!
        /// 6. Return the created product with ID
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

            // IMPORTANT: Invalidate cache - new product added, cache is now stale
            _cache.Remove(CACHE_KEY_ALL_PRODUCTS);
            _cache.Remove($"{CACHE_KEY_CATEGORY_PREFIX}{product.Category}");
            Console.WriteLine($"🗑️  Cache invalidated: New product '{product.Name}' added (ID: {product.Id})");

            return product;
        }

        /// <summary>
        /// READ OPERATION - Get All (WITH CACHING)
        /// Flow:
        /// 1. Check if products exist in cache (IMemoryCache)
        /// 2. If cache hit: return cached list immediately (100x faster!)
        /// 3. If cache miss: query database
        /// 4. Store result in cache for 5 minutes
        /// 5. Return list to caller
        /// NOTE: We filter IsActive here to implement soft delete logic
        /// </summary>
        public async Task<List<Product>> GetAllProductsAsync()
        {
            // IMPORTANT FLOW: Cache Check
            // Try to get from cache first
            if (_cache.TryGetValue(CACHE_KEY_ALL_PRODUCTS, out List<Product>? cachedProducts))
            {
                Console.WriteLine($"✓ CACHE HIT: GetAllProducts returning {cachedProducts?.Count} products from memory");
                return cachedProducts!;
            }

            // Cache miss - fetch from database
            Console.WriteLine("✗ CACHE MISS: GetAllProducts fetching from database");

            // IMPORTANT: AsNoTracking() improves performance for read-only queries
            // Change tracker is disabled since we're not modifying these entities
            var products = await _context.Products
                .Where(p => p.IsActive)
                .OrderBy(p => p.Name)
                .AsNoTracking()
                .ToListAsync();

            // Store in cache with 5-minute expiration
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

            _cache.Set(CACHE_KEY_ALL_PRODUCTS, products, cacheOptions);

            return products;
        }

        /// <summary>
        /// READ OPERATION - Get Single (WITH CACHING)
        /// Flow:
        /// 1. Check cache for product by ID
        /// 2. If found: return from cache
        /// 3. If not found: query database
        /// 4. Check if active
        /// 5. Store in cache
        /// 6. Return product or null if not found
        /// NOTE: FindAsync uses indexes for fast lookup
        /// </summary>
        public async Task<Product?> GetProductByIdAsync(int id)
        {
            string cacheKey = $"{CACHE_KEY_PRODUCT_PREFIX}{id}";

            // Check cache first
            if (_cache.TryGetValue(cacheKey, out Product? cachedProduct))
            {
                Console.WriteLine($"✓ CACHE HIT: GetProductById({id}) returning from cache");
                return cachedProduct;
            }

            Console.WriteLine($"✗ CACHE MISS: GetProductById({id}) fetching from database");

            // FindAsync is optimized for primary key lookups
            var product = await _context.Products.FindAsync(id);

            // Return null if not found or if marked as deleted
            if (product == null || !product.IsActive)
            {
                return null;
            }

            // Cache the product
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

            _cache.Set(cacheKey, product, cacheOptions);

            return product;
        }

        /// <summary>
        /// READ OPERATION - Filter by Category (WITH CACHING)
        /// Flow:
        /// 1. Check cache for category products
        /// 2. If found: return from cache
        /// 3. If not found: query database
        /// 4. Filter by category name (uses index for performance)
        /// 5. Filter only active products
        /// 6. Order by name for consistent results
        /// 7. Cache and return
        /// </summary>
        public async Task<List<Product>> GetProductsByCategoryAsync(string category)
        {
            string cacheKey = $"{CACHE_KEY_CATEGORY_PREFIX}{category}";

            // Check cache first
            if (_cache.TryGetValue(cacheKey, out List<Product>? cachedProducts))
            {
                Console.WriteLine($"✓ CACHE HIT: GetProductsByCategory({category}) returning {cachedProducts?.Count} from cache");
                return cachedProducts!;
            }

            Console.WriteLine($"✗ CACHE MISS: GetProductsByCategory({category}) fetching from database");

            var products = await _context.Products
                .Where(p => p.Category == category && p.IsActive)
                .OrderBy(p => p.Name)
                .AsNoTracking()
                .ToListAsync();

            // Cache the results
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

            _cache.Set(cacheKey, products, cacheOptions);

            return products;
        }

        /// <summary>
        /// UPDATE OPERATION (WITH CACHE INVALIDATION)
        /// Flow:
        /// 1. Fetch the existing product from database
        /// 2. Check if found and active
        /// 3. Update all properties with new values
        /// 4. Update the UpdatedDate timestamp
        /// 5. Call SaveChangesAsync to persist changes
        /// 6. Invalidate cache - product data changed!
        /// 7. Return updated product
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

            string oldCategory = existingProduct.Category;

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

            // IMPORTANT: Invalidate relevant cache entries
            _cache.Remove($"{CACHE_KEY_PRODUCT_PREFIX}{id}");
            _cache.Remove(CACHE_KEY_ALL_PRODUCTS);
            _cache.Remove($"{CACHE_KEY_CATEGORY_PREFIX}{oldCategory}");
            if (oldCategory != existingProduct.Category)
            {
                _cache.Remove($"{CACHE_KEY_CATEGORY_PREFIX}{existingProduct.Category}");
            }
            Console.WriteLine($"🗑️  Cache invalidated: Product '{existingProduct.Name}' (ID: {id}) updated");

            return existingProduct;
        }

        /// <summary>
        /// DELETE OPERATION (Soft Delete with CACHE INVALIDATION)
        /// Flow:
        /// 1. Find the product
        /// 2. Check if exists and is active
        /// 3. Mark IsActive = false instead of deleting from database
        /// 4. Update the UpdatedDate
        /// 5. Save changes
        /// 6. Invalidate cache - product list changed!
        /// 7. Return success status
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

            // IMPORTANT: Invalidate cache - product removed from active list
            _cache.Remove($"{CACHE_KEY_PRODUCT_PREFIX}{id}");
            _cache.Remove(CACHE_KEY_ALL_PRODUCTS);
            _cache.Remove($"{CACHE_KEY_CATEGORY_PREFIX}{product.Category}");
            Console.WriteLine($"🗑️  Cache invalidated: Product '{product.Name}' (ID: {id}) deleted");

            return true;
        }

        /// <summary>
        /// UPDATE STOCK OPERATION (WITH CACHE INVALIDATION)
        /// Flow:
        /// 1. Find the product
        /// 2. Validate that we have sufficient stock (if decreasing)
        /// 3. Update the StockQuantity
        /// 4. Save changes
        /// 5. Invalidate cache - stock changed!
        /// 6. Return success status
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

            // Invalidate cache - stock quantity changed
            _cache.Remove($"{CACHE_KEY_PRODUCT_PREFIX}{id}");
            _cache.Remove(CACHE_KEY_ALL_PRODUCTS);
            _cache.Remove($"{CACHE_KEY_CATEGORY_PREFIX}{product.Category}");
            Console.WriteLine($"🗑️  Cache invalidated: Stock updated for product '{product.Name}' (ID: {id})");

            return true;
        }
    }
}
