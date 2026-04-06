using Microsoft.AspNetCore.Mvc;
using ProductCatalogMVC.Models;
using ProductCatalogMVC.Services;

namespace ProductCatalogMVC.Controllers;

/// <summary>
/// IMPORTANT FLOW #1: ProductsController
/// Handles all product CRUD operations
/// Communicates with ProductService (which calls API)
/// Returns views for rendering HTML
/// </summary>
public class ProductsController : Controller
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    /// <summary>
    /// GET: /Products/Index
    /// Display all products in a table/list view
    /// Supports searching by name and filtering by category
    /// </summary>
    public async Task<IActionResult> Index(string searchTerm = "", string categoryFilter = "")
    {
        var products = await _productService.GetAllProductsAsync();

        if (!string.IsNullOrEmpty(searchTerm))
        {
            products = products.Where(p => p.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        if (!string.IsNullOrEmpty(categoryFilter))
        {
            products = products.Where(p => p.Category == categoryFilter).ToList();
        }

        ViewBag.SearchTerm = searchTerm;
        ViewBag.CategoryFilter = categoryFilter;
        ViewBag.Categories = products.Select(p => p.Category).Distinct().OrderBy(c => c).ToList();

        return View(products);
    }

    /// <summary>
    /// GET: /Products/Details/5
    /// Display detailed view of a single product
    /// </summary>
    public async Task<IActionResult> Details(int? id)
    {
        if (id == null)
            return NotFound();

        var product = await _productService.GetProductByIdAsync(id.Value);
        if (product == null)
            return NotFound();

        return View(product);
    }

    /// <summary>
    /// GET: /Products/Create
    /// Display form for creating a new product
    /// </summary>
    public IActionResult Create()
    {
        return View();
    }

    /// <summary>
    /// POST: /Products/Create
    /// Process form submission to create new product
    /// Redirects to Index on success, shows form with errors on failure
    /// </summary>
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Name,Description,Price,StockQuantity,Category")] Product product)
    {
        if (ModelState.IsValid)
        {
            var created = await _productService.CreateProductAsync(product);
            if (created != null)
            {
                TempData["SuccessMessage"] = $"Product '{created.Name}' created successfully!";
                return RedirectToAction(nameof(Index));
            }
            else
            {
                ModelState.AddModelError("", "Failed to create product. Please try again.");
            }
        }
        return View(product);
    }

    /// <summary>
    /// GET: /Products/Edit/5
    /// Display form for editing an existing product
    /// </summary>
    public async Task<IActionResult> Edit(int? id)
    {
        if (id == null)
            return NotFound();

        var product = await _productService.GetProductByIdAsync(id.Value);
        if (product == null)
            return NotFound();

        return View(product);
    }

    /// <summary>
    /// POST: /Products/Edit/5
    /// Process form submission to update product
    /// </summary>
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, [Bind("Id,Name,Description,Price,StockQuantity,Category")] Product product)
    {
        if (id != product.Id)
            return NotFound();

        if (ModelState.IsValid)
        {
            var success = await _productService.UpdateProductAsync(id, product);
            if (success)
            {
                TempData["SuccessMessage"] = $"Product '{product.Name}' updated successfully!";
                return RedirectToAction(nameof(Index));
            }
            else
            {
                ModelState.AddModelError("", "Failed to update product. Please try again.");
            }
        }
        return View(product);
    }

    /// <summary>
    /// GET: /Products/Delete/5
    /// Display confirmation page for deleting a product
    /// </summary>
    public async Task<IActionResult> Delete(int? id)
    {
        if (id == null)
            return NotFound();

        var product = await _productService.GetProductByIdAsync(id.Value);
        if (product == null)
            return NotFound();

        return View(product);
    }

    /// <summary>
    /// POST: /Products/Delete/5
    /// Process delete request (soft delete via API)
    /// </summary>
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        if (product != null)
        {
            var success = await _productService.DeleteProductAsync(id);
            if (success)
            {
                TempData["SuccessMessage"] = $"Product '{product.Name}' deleted successfully!";
                return RedirectToAction(nameof(Index));
            }
        }
        TempData["ErrorMessage"] = "Failed to delete product. Please try again.";
        return RedirectToAction(nameof(Index));
    }
}
