using ProductCatalogMVC.Models;

namespace ProductCatalogMVC.Services;

/// <summary>
/// IMPORTANT FLOW #1: IProductService Interface
/// Abstracts the HTTP communication with ProductCatalogAPI
/// Enables easy mocking for testing
/// </summary>
public interface IProductService
{
    Task<List<Product>> GetAllProductsAsync();
    Task<Product?> GetProductByIdAsync(int id);
    Task<List<Product>> GetProductsByCategoryAsync(string category);
    Task<Product?> CreateProductAsync(Product product);
    Task<bool> UpdateProductAsync(int id, Product product);
    Task<bool> DeleteProductAsync(int id);
    Task<bool> UpdateStockAsync(int id, int quantity);
}

/// <summary>
/// IMPORTANT FLOW #2: ProductService Implementation
/// Communicates with ProductCatalogAPI via HttpClient
/// Handles all API calls with error handling
/// Uses dependency injection for HttpClient
/// </summary>
public class ProductService : IProductService
{
    private readonly HttpClient _httpClient;

    public ProductService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<List<Product>> GetAllProductsAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("api/products");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsAsync<List<Product>>() ?? new List<Product>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching products: {ex.Message}");
            return new List<Product>();
        }
    }

    public async Task<Product?> GetProductByIdAsync(int id)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/products/{id}");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsAsync<Product>();
            }
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching product {id}: {ex.Message}");
            return null;
        }
    }

    public async Task<List<Product>> GetProductsByCategoryAsync(string category)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/products/category/{category}");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsAsync<List<Product>>() ?? new List<Product>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching products by category: {ex.Message}");
            return new List<Product>();
        }
    }

    public async Task<Product?> CreateProductAsync(Product product)
    {
        try
        {
            var content = JsonContent.Create(product);
            var response = await _httpClient.PostAsync("api/products", content);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsAsync<Product>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating product: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> UpdateProductAsync(int id, Product product)
    {
        try
        {
            var content = JsonContent.Create(product);
            var response = await _httpClient.PutAsync($"api/products/{id}", content);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating product: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        try
        {
            var response = await _httpClient.DeleteAsync($"api/products/{id}");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting product: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> UpdateStockAsync(int id, int quantity)
    {
        try
        {
            var content = JsonContent.Create(new { quantity });
            var response = await _httpClient.PatchAsync($"api/products/{id}/stock", content);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating stock: {ex.Message}");
            return false;
        }
    }
}
