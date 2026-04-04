using Microsoft.AspNetCore.Mvc;
using ProductCatalogAPI.Models;
using ProductCatalogAPI.Services;

namespace ProductCatalogAPI.Controllers
{
    /// <summary>
    /// ADO.NET REST API Controller
    ///
    /// IMPORTANT FLOW: Demonstrates the same CRUD operations as EF Core,
    /// but using ADO.NET (raw SQL) instead of ORM.
    ///
    /// Compare with ProductsController (EF Core) to see the differences!
    ///
    /// Performance: ⭐⭐⭐⭐⭐ Fastest (direct SQL execution)
    /// Code Length: ⭐⭐ Verbose (lots of manual mapping)
    /// Development Time: ⭐⭐ Slow (lots of SQL to write)
    /// Type Safety: ⭐⭐ Low (no compile-time checks)
    ///
    /// Use ADO.NET when:
    /// ✅ Performance is critical
    /// ✅ Working with stored procedures
    /// ✅ Complex queries with aggregations
    /// ✅ Raw SQL is more efficient than LINQ
    /// ❌ Avoid: Standard CRUD (use EF Core instead)
    /// </summary>
    [ApiController]
    [Route("api/ado/[controller]")]
    public class AdoProductsController : ControllerBase
    {
        private readonly IProductAdoService _adoService;
        private readonly ILogger<AdoProductsController> _logger;

        public AdoProductsController(IProductAdoService adoService, ILogger<AdoProductsController> logger)
        {
            _adoService = adoService;
            _logger = logger;
        }

        /// <summary>
        /// GET /api/ado/products
        /// Get all products using ADO.NET
        /// Endpoint: http://localhost:5000/api/ado/products
        /// </summary>
        [HttpGet]
        [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
        [ProducesResponseType(typeof(IEnumerable<Product>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Product>>> GetAllProducts()
        {
            try
            {
                _logger.LogInformation("[ADO.NET REST] GET /api/ado/products");
                var products = await _adoService.GetAllProductsAsync();
                _logger.LogInformation($"[ADO.NET REST] Retrieved {products.Count} products");
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ADO.NET REST] Error in GetAllProducts");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// GET /api/ado/products/{id}
        /// Get single product by ID using ADO.NET
        /// Endpoint: http://localhost:5000/api/ado/products/1
        /// </summary>
        [HttpGet("{id}")]
        [ResponseCache(Duration = 600, Location = ResponseCacheLocation.Any)]
        [ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Product>> GetProductById(int id)
        {
            try
            {
                if (id <= 0) return BadRequest(new { error = "Invalid product ID" });

                _logger.LogInformation($"[ADO.NET REST] GET /api/ado/products/{id}");
                var product = await _adoService.GetProductByIdAsync(id);

                if (product == null)
                {
                    _logger.LogWarning($"[ADO.NET REST] Product not found: {id}");
                    return NotFound(new { error = $"Product with ID {id} not found" });
                }

                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[ADO.NET REST] Error in GetProductById({id})");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// GET /api/ado/products/category/{category}
        /// Get products by category using ADO.NET
        /// Endpoint: http://localhost:5000/api/ado/products/category/Electronics
        /// </summary>
        [HttpGet("category/{category}")]
        [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "category" })]
        [ProducesResponseType(typeof(IEnumerable<Product>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsByCategory(string category)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(category))
                    return BadRequest(new { error = "Category is required" });

                _logger.LogInformation($"[ADO.NET REST] GET /api/ado/products/category/{category}");
                var products = await _adoService.GetProductsByCategoryAsync(category);
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[ADO.NET REST] Error in GetProductsByCategory({category})");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// POST /api/ado/products
        /// Create new product using ADO.NET
        /// Endpoint: http://localhost:5000/api/ado/products
        /// Body: { "name": "Laptop", "price": 999.99, "stockQuantity": 10, "category": "Electronics" }
        /// </summary>
        [HttpPost]
        [ResponseCache(NoStore = true)]
        [ProducesResponseType(typeof(Product), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Product>> CreateProduct([FromBody] CreateProductRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                    return BadRequest(new { error = "Product name is required" });

                if (request.Price <= 0)
                    return BadRequest(new { error = "Price must be greater than zero" });

                var product = new Models.Product
                {
                    Name = request.Name,
                    Description = request.Description,
                    Price = request.Price,
                    StockQuantity = request.StockQuantity,
                    Category = request.Category
                };

                _logger.LogInformation($"[ADO.NET REST] POST /api/ado/products - Creating: {product.Name}");
                var createdProduct = await _adoService.CreateProductAsync(product);

                return CreatedAtAction(nameof(GetProductById),
                    new { id = createdProduct.Id }, createdProduct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ADO.NET REST] Error in CreateProduct");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// PUT /api/ado/products/{id}
        /// Update product using ADO.NET
        /// Endpoint: http://localhost:5000/api/ado/products/1
        /// </summary>
        [HttpPut("{id}")]
        [ResponseCache(NoStore = true)]
        [ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Product>> UpdateProduct(int id, [FromBody] UpdateProductRequest request)
        {
            try
            {
                if (id <= 0) return BadRequest(new { error = "Invalid product ID" });
                if (string.IsNullOrWhiteSpace(request.Name))
                    return BadRequest(new { error = "Product name is required" });

                var product = new Models.Product
                {
                    Name = request.Name,
                    Description = request.Description,
                    Price = request.Price,
                    StockQuantity = request.StockQuantity,
                    Category = request.Category
                };

                _logger.LogInformation($"[ADO.NET REST] PUT /api/ado/products/{id}");
                var updatedProduct = await _adoService.UpdateProductAsync(id, product);

                if (updatedProduct == null)
                    return NotFound(new { error = $"Product with ID {id} not found" });

                return Ok(updatedProduct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[ADO.NET REST] Error in UpdateProduct({id})");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// DELETE /api/ado/products/{id}
        /// Delete product (soft delete) using ADO.NET
        /// Endpoint: http://localhost:5000/api/ado/products/1
        /// </summary>
        [HttpDelete("{id}")]
        [ResponseCache(NoStore = true)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                if (id <= 0) return BadRequest(new { error = "Invalid product ID" });

                _logger.LogInformation($"[ADO.NET REST] DELETE /api/ado/products/{id}");
                var result = await _adoService.DeleteProductAsync(id);

                if (!result)
                    return NotFound(new { error = $"Product with ID {id} not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[ADO.NET REST] Error in DeleteProduct({id})");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// PATCH /api/ado/products/{id}/stock
        /// Update product stock using ADO.NET
        /// Endpoint: http://localhost:5000/api/ado/products/1/stock
        /// Body: { "quantityAdjustment": 5 }
        /// </summary>
        [HttpPatch("{id}/stock")]
        [ResponseCache(NoStore = true)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Product>> UpdateStock(int id, [FromBody] UpdateStockRequest request)
        {
            try
            {
                _logger.LogInformation($"[ADO.NET REST] PATCH /api/ado/products/{id}/stock - Adjusting by {request.QuantityAdjustment}");

                var result = await _adoService.UpdateStockAsync(id, request.QuantityAdjustment);
                if (!result)
                    return BadRequest(new { error = "Could not update stock" });

                var updatedProduct = await _adoService.GetProductByIdAsync(id);
                return Ok(updatedProduct);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[ADO.NET REST] Error in UpdateStock({id})");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }
    }

    // DTOs are already defined in ProductsController.cs
    // We reuse them for consistency across all data access approaches
}
