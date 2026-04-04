using Microsoft.EntityFrameworkCore;
using ProductCatalogAPI.Models;

namespace ProductCatalogAPI.Data
{
    /// <summary>
    /// IMPORTANT FLOW #2: DATABASE CONTEXT
    /// DbContext is the bridge between your C# code and the database.
    /// It manages database connections, queries, and change tracking.
    /// </summary>
    public class ProductDbContext : DbContext
    {
        // Constructor receives DbContextOptions from dependency injection
        public ProductDbContext(DbContextOptions<ProductDbContext> options)
            : base(options)
        {
        }

        // DbSet<T> represents a table in the database
        // We use this to query and save Product entities
        public DbSet<Product> Products { get; set; }

        /// <summary>
        /// IMPORTANT FLOW #2.1: MODEL CONFIGURATION
        /// OnModelCreating is called when the model is created.
        /// Use this to configure entity mappings, constraints, and relationships.
        /// </summary>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure the Product entity
            modelBuilder.Entity<Product>(entity =>
            {
                // Set the table name explicitly
                entity.ToTable("Products");

                // Configure Primary Key
                entity.HasKey(p => p.Id);

                // Configure Name property (required, max length)
                entity.Property(p => p.Name)
                    .IsRequired()
                    .HasMaxLength(100)
                    .HasColumnType("nvarchar(100)");

                // Configure Description property (optional, max length)
                entity.Property(p => p.Description)
                    .HasMaxLength(500)
                    .HasColumnType("nvarchar(500)");

                // Configure Price property (decimal with precision)
                entity.Property(p => p.Price)
                    .HasPrecision(10, 2); // 10 digits total, 2 after decimal

                // Configure StockQuantity
                entity.Property(p => p.StockQuantity)
                    .IsRequired();

                // Configure Category
                entity.Property(p => p.Category)
                    .IsRequired()
                    .HasMaxLength(50);

                // Configure timestamps
                entity.Property(p => p.CreatedDate)
                    .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()"); // SQL Server function

                entity.Property(p => p.UpdatedDate)
                    .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()");

                // Index for frequently searched columns
                entity.HasIndex(p => p.Category).HasDatabaseName("IX_Product_Category");
                entity.HasIndex(p => p.Name).HasDatabaseName("IX_Product_Name");
            });
        }
    }
}
