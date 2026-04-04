using Microsoft.AspNetCore.Mvc;
using ProductCatalogAPI.Models;
using ProductCatalogAPI.Services;

namespace ProductCatalogAPI.Controllers
{
    /// <summary>
    /// IMPORTANT FLOW #4: API CONTROLLER
    /// Controllers handle HTTP requests and responses.
    /// They delegate business logic to services and return API responses.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        // IMPORTANT: Dependency injection - service is injected by ASP.NET Core
        private readonly IProductService _productService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(IProductService productService, ILogger<ProductsController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        /// <summary>
        /// CREATE - HTTP POST /api/products
        /// Flow:
        /// 1. Client sends JSON with product details in request body
        /// 2. ASP.NET Core deserializes JSON to Product object (model binding)
        /// 3. Controller validates the product
        /// 4. Calls service to create product in database
        /// 5. Returns 201 Created with product and Location header
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct([FromBody] CreateProductRequest request)
        {
            // IMPORTANT: Input validation
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Product name is required");
            }

            if (request.Price <= 0)
            {
                return BadRequest("Price must be greater than zero");
            }

            // Create the product entity from the request
            var product = new Product
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                StockQuantity = request.StockQuantity,
                Category = request.Category
            };

            try
            {
                // Call service to persist to database
                var createdProduct = await _productService.CreateProductAsync(product);

                // Log the creation
                _logger.LogInformation($"Product created with ID: {createdProduct.Id}");

                // Return 201 Created with Location header
                return CreatedAtAction(
                    nameof(GetProductById),
                    new { id = createdProduct.Id },
                    createdProduct
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// READ ALL - HTTP GET /api/products
        /// Flow:
        /// 1. Client sends GET request
        /// 2. Controller calls service to fetch all products
        /// 3. Service queries database asynchronously
        /// 4. Returns 200 OK with list of products
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetAllProducts()
        {
            try
            {
                // Call service to get all products
                var products = await _productService.GetAllProductsAsync();

                _logger.LogInformation($"Retrieved {products.Count} products");

                // Return 200 OK with product list
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// READ SINGLE - HTTP GET /api/products/{id}
        /// Flow:
        /// 1. Client sends GET request with product ID in URL
        /// 2. ASP.NET Core extracts ID from route
        /// 3. Controller calls service to find product by ID
        /// 4. Returns 200 OK with product if found, 404 Not Found if not
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProductById(int id)
        {
            try
            {
                // Validate input
                if (id <= 0)
                {
                    return BadRequest("Invalid product ID");
                }

                // Call service to get product
                var product = await _productService.GetProductByIdAsync(id);

                if (product == null)
                {
                    _logger.LogWarning($"Product not found with ID: {id}");
                    return NotFound($"Product with ID {id} not found");
                }

                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// READ BY CATEGORY - HTTP GET /api/products/category/{category}
        /// Flow:
        /// 1. Client sends GET request with category name in URL
        /// 2. Controller extracts category from route
        /// 3. Service filters products by category
        /// 4. Returns all matching products
        /// </summary>
        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsByCategory(string category)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(category))
                {
                    return BadRequest("Category is required");
                }

                var products = await _productService.GetProductsByCategoryAsync(category);

                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products by category");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// UPDATE - HTTP PUT /api/products/{id}
        /// Flow:
        /// 1. Client sends PUT request with ID in URL and updated data in body
        /// 2. Controller calls service to update the product
        /// 3. Service locates product, updates properties, saves to database
        /// 4. Returns 200 OK with updated product or 404 if not found
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<Product>> UpdateProduct(int id, [FromBody] UpdateProductRequest request)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest("Invalid product ID");
                }

                // Validate required fields
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return BadRequest("Product name is required");
                }

                if (request.Price <= 0)
                {
                    return BadRequest("Price must be greater than zero");
                }

                // Create product entity with updated values
                var product = new Product
                {
                    Name = request.Name,
                    Description = request.Description,
                    Price = request.Price,
                    StockQuantity = request.StockQuantity,
                    Category = request.Category
                };

                // Call service to update
                var updatedProduct = await _productService.UpdateProductAsync(id, product);

                if (updatedProduct == null)
                {
                    return NotFound($"Product with ID {id} not found");
                }

                _logger.LogInformation($"Product updated with ID: {id}");

                return Ok(updatedProduct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// DELETE - HTTP DELETE /api/products/{id}
        /// Flow:
        /// 1. Client sends DELETE request with product ID in URL
        /// 2. Controller validates ID
        /// 3. Calls service to delete (soft delete) the product
        /// 4. Returns 204 No Content if successful, 404 if not found
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest("Invalid product ID");
                }

                // Call service to delete (soft delete)
                var result = await _productService.DeleteProductAsync(id);

                if (!result)
                {
                    return NotFound($"Product with ID {id} not found");
                }

                _logger.LogInformation($"Product deleted with ID: {id}");

                // Return 204 No Content (successful deletion, no body to return)
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// UPDATE STOCK - HTTP PATCH /api/products/{id}/stock
        /// Flow:
        /// 1. Client sends PATCH with quantity adjustment
        /// 2. Positive number = add to stock, negative = remove from stock
        /// 3. Service validates and updates stock
        /// 4. Returns updated product
        /// </summary>
        [HttpPatch("{id}/stock")]
        public async Task<ActionResult<Product>> UpdateStock(int id, [FromBody] UpdateStockRequest request)
        {
            try
            {
                // Try to update stock
                await _productService.UpdateStockAsync(id, request.QuantityAdjustment);

                // Get the updated product
                var updatedProduct = await _productService.GetProductByIdAsync(id);

                return Ok(updatedProduct);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stock");
                return StatusCode(500, "Internal server error");
            }
        }
    }

    // IMPORTANT: Request/Response DTOs (Data Transfer Objects)
    // These separate the API contract from internal database models
    // This allows changing the database model without breaking the API

    /// <summary>
    /// REQUEST DTO for creating a new product
    /// The client sends this JSON structure in the request body
    /// </summary>
    public class CreateProductRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string Category { get; set; } = string.Empty;
    }

    /// <summary>
    /// REQUEST DTO for updating a product
    /// Similar to CreateProductRequest
    /// </summary>
    public class UpdateProductRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string Category { get; set; } = string.Empty;
    }

    /// <summary>
    /// REQUEST DTO for stock updates
    /// Simple structure with just the quantity adjustment
    /// </summary>
    public class UpdateStockRequest
    {
        public int QuantityAdjustment { get; set; }
    }
}
