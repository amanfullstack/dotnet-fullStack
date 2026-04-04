using ProductCatalogAPI.Models;
using ProductCatalogAPI.Services;
using HotChocolate;

namespace ProductCatalogAPI.GraphQL
{
    /// <summary>
    /// GraphQL Query Type - Defines all available queries
    ///
    /// GraphQL allows clients to request EXACTLY the fields they need.
    /// No over-fetching (unnecessary fields) with GraphQL!
    ///
    /// Example Query (client sends):
    /// {
    ///   products {
    ///     id
    ///     name
    ///     price
    ///   }
    /// }
    ///
    /// Response (only includes requested fields):
    /// {
    ///   "data": {
    ///     "products": [
    ///       { "id": 1, "name": "Laptop", "price": 999.99 },
    ///       { "id": 2, "name": "Mouse", "price": 29.99 }
    ///     ]
    ///   }
    /// }
    /// </summary>
    public class ProductQuery
    {
        /// <summary>
        /// Get all products
        /// GraphQL Query: { products { id name price category } }
        /// </summary>
        public async Task<List<Product>> GetProducts(
            [Service] IProductService productService)
        {
            Console.WriteLine("[GraphQL] Query: GetProducts");
            return await productService.GetAllProductsAsync();
        }

        /// <summary>
        /// Get product by ID
        /// GraphQL Query: { productById(id: 1) { id name price } }
        /// </summary>
        public async Task<Product?> GetProductById(
            int id,
            [Service] IProductService productService)
        {
            Console.WriteLine($"[GraphQL] Query: GetProductById({id})");
            return await productService.GetProductByIdAsync(id);
        }

        /// <summary>
        /// Get products by category
        /// GraphQL Query: { productsByCategory(category: "Electronics") { id name category } }
        /// </summary>
        public async Task<List<Product>> GetProductsByCategory(
            string category,
            [Service] IProductService productService)
        {
            Console.WriteLine($"[GraphQL] Query: GetProductsByCategory({category})");
            return await productService.GetProductsByCategoryAsync(category);
        }

        /// <summary>
        /// Search expensive products
        /// GraphQL Query: { expensiveProducts(minPrice: 100) { id name price } }
        /// </summary>
        public async Task<List<Product>> GetExpensiveProducts(
            decimal minPrice,
            [Service] IProductService productService)
        {
            Console.WriteLine($"[GraphQL] Query: GetExpensiveProducts(minPrice: {minPrice})");
            var allProducts = await productService.GetAllProductsAsync();
            return allProducts.Where(p => p.Price >= minPrice).OrderByDescending(p => p.Price).ToList();
        }

        /// <summary>
        /// Get low stock products
        /// GraphQL Query: { lowStockProducts(threshold: 10) { id name stockQuantity } }
        /// </summary>
        public async Task<List<Product>> GetLowStockProducts(
            int threshold,
            [Service] IProductService productService)
        {
            Console.WriteLine($"[GraphQL] Query: GetLowStockProducts(threshold: {threshold})");
            var allProducts = await productService.GetAllProductsAsync();
            return allProducts.Where(p => p.StockQuantity <= threshold).OrderBy(p => p.StockQuantity).ToList();
        }
    }

    /// <summary>
    /// GraphQL Mutation Type - Defines all available mutations (Create/Update/Delete)
    ///
    /// Mutations modify data. Use when you want to create, update, or delete.
    ///
    /// Example Mutation (client sends):
    /// mutation {
    ///   createProduct(input: {
    ///     name: "New Product"
    ///     price: 99.99
    ///     stockQuantity: 10
    ///     category: "Electronics"
    ///   }) {
    ///     id
    ///     name
    ///     price
    ///   }
    /// }
    /// </summary>
    public class ProductMutation
    {
        /// <summary>
        /// Create new product
        /// GraphQL Mutation: mutation { createProduct(input: {...}) { id name price } }
        /// </summary>
        public async Task<Product> CreateProduct(
            CreateProductInput input,
            [Service] IProductService productService)
        {
            Console.WriteLine($"[GraphQL] Mutation: CreateProduct({input.Name})");

            var product = new Product
            {
                Name = input.Name,
                Description = input.Description ?? "",
                Price = input.Price,
                StockQuantity = input.StockQuantity,
                Category = input.Category
            };

            return await productService.CreateProductAsync(product);
        }

        /// <summary>
        /// Update existing product
        /// GraphQL Mutation: mutation { updateProduct(id: 1, input: {...}) { id name } }
        /// </summary>
        public async Task<Product?> UpdateProduct(
            int id,
            UpdateProductInput input,
            [Service] IProductService productService)
        {
            Console.WriteLine($"[GraphQL] Mutation: UpdateProduct({id})");

            var product = new Product
            {
                Name = input.Name,
                Description = input.Description ?? "",
                Price = input.Price,
                StockQuantity = input.StockQuantity,
                Category = input.Category
            };

            return await productService.UpdateProductAsync(id, product);
        }

        /// <summary>
        /// Delete product (soft delete)
        /// GraphQL Mutation: mutation { deleteProduct(id: 1) }
        /// </summary>
        public async Task<DeleteProductResponse> DeleteProduct(
            int id,
            [Service] IProductService productService)
        {
            Console.WriteLine($"[GraphQL] Mutation: DeleteProduct({id})");

            var success = await productService.DeleteProductAsync(id);
            return new DeleteProductResponse
            {
                Success = success,
                Message = success ? "Product deleted successfully" : "Product not found"
            };
        }

        /// <summary>
        /// Update product stock
        /// GraphQL Mutation: mutation { updateStock(id: 1, quantity: 5) { id stockQuantity } }
        /// </summary>
        public async Task<Product?> UpdateStock(
            int id,
            int quantity,
            [Service] IProductService productService)
        {
            Console.WriteLine($"[GraphQL] Mutation: UpdateStock({id}, {quantity})");

            var success = await productService.UpdateStockAsync(id, quantity);
            if (!success) return null;

            return await productService.GetProductByIdAsync(id);
        }
    }

    // ============== Input Types (for mutations) ==============

    /// <summary>
    /// Input type for creating product
    /// Used in GraphQL mutations
    /// </summary>
    public class CreateProductInput
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string Category { get; set; } = string.Empty;
    }

    /// <summary>
    /// Input type for updating product
    /// </summary>
    public class UpdateProductInput
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string Category { get; set; } = string.Empty;
    }

    // ============== Response Types ==============

    /// <summary>
    /// Response type for delete operation
    /// </summary>
    public class DeleteProductResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
