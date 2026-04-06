namespace ProductCatalogMVC.Models;

/// <summary>
/// IMPORTANT FLOW #1: Product Entity
/// This is the same entity as ProductCatalogAPI
/// Used for binding to views and API communication
/// </summary>
public class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }

    public string Category { get; set; } = string.Empty;

    public DateTime CreatedDate { get; set; }

    public DateTime UpdatedDate { get; set; }

    public bool IsActive { get; set; } = true;
}

/// <summary>
/// IMPORTANT FLOW #2: Product View Model
/// Used for form operations (Create/Edit)
/// Separates API model from view concerns
/// </summary>
public class ProductViewModel
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }

    public string Category { get; set; } = string.Empty;

    // For validation and error handling
    public string? ErrorMessage { get; set; }

    public bool IsSuccess { get; set; }
}
