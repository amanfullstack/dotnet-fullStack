namespace ProductCatalogAPI.Models
{
    /// <summary>
    /// IMPORTANT FLOW #1: DATA MODEL
    /// This represents the Product entity that will be stored in the database.
    /// Every property maps to a column in the Products table.
    /// </summary>
    public class Product
    {
        // Primary Key: Uniquely identifies each product
        public int Id { get; set; }

        // Product Name - Required field
        public string Name { get; set; } = string.Empty;

        // Product Description - Optional details
        public string Description { get; set; } = string.Empty;

        // Price - stored as decimal for monetary values (important for precision)
        public decimal Price { get; set; }

        // Stock Quantity - how many units available
        public int StockQuantity { get; set; }

        // Category - helps organize products
        public string Category { get; set; } = string.Empty;

        // Track when the product was created
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Track when the product was last updated
        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

        // Soft delete - marks if product is active or archived
        public bool IsActive { get; set; } = true;
    }
}
