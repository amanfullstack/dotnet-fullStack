# ⚡ Commands Cheatsheet - Quick Lookup

Essential commands for building, running, and managing your .NET Web API project.

---

## 🎯 Most Used Commands

```bash
# 1. Navigate to project
cd d:\dotnet-fullStack\ProductCatalogAPI-WebAPI-EFCore

# 2. Build project
dotnet build

# 3. Run project
dotnet run

# 4. Clean build artifacts
dotnet clean

# 5. Restore packages
dotnet restore
```

---

## 🔨 Building

```bash
# Build in Debug mode (default)
dotnet build

# Build in Release mode (optimized)
dotnet build --configuration Release

# Build without incremental compilation (full rebuild)
dotnet build --no-incremental

# Show verbose build output
dotnet build --verbosity detailed

# Clean and rebuild
dotnet clean && dotnet build
```

---

## ▶️ Running

```bash
# Run with default settings
dotnet run

# Run in Release mode
dotnet run --configuration Release

# Run without rebuild (just execute)
dotnet run --no-build

# Run specific project
dotnet run --project ProductCatalogAPI.csproj

# Run with environment variable
set ASPNETCORE_ENVIRONMENT=Production && dotnet run
```

---

## 📦 Package Management

```bash
# List all NuGet packages
dotnet list package

# Add NuGet package
dotnet add package [PackageName]

# Add specific version
dotnet add package [PackageName] --version [Version]

# Remove package
dotnet remove package [PackageName]

# Restore packages
dotnet restore

# Update all packages
dotnet outdated  # List outdated packages
```

---

## 🗄️ Entity Framework Core

```bash
# List migrations
dotnet ef migrations list

# Create new migration
dotnet ef migrations add [MigrationName]
# Example: dotnet ef migrations add AddProductsTable

# Remove last migration
dotnet ef migrations remove

# Apply migrations to database
dotnet ef database update

# Update to specific migration
dotnet ef database update [MigrationName]

# Revert all migrations
dotnet ef database update 0

# Generate migration script (don't apply)
dotnet ef migrations script

# Generate script from migration to migration
dotnet ef migrations script [FromMigration] [ToMigration]

# Drop database
dotnet ef database drop

# Get DbContext info
dotnet ef dbcontext info
```

---

## 🧪 Testing & Debugging

```bash
# Run in Debug mode
dotnet run --configuration Debug

# Run with detailed output
dotnet build --verbosity diagnostic

# Generate NuGet package (for distribution)
dotnet pack

# Publish as standalone app
dotnet publish --configuration Release
```

---

## 🌐 HTTP Requests (Using curl)

```bash
# GET all products
curl http://localhost:5000/api/products

# GET with verbose output (shows headers)
curl -i http://localhost:5000/api/products

# GET specific product
curl http://localhost:5000/api/products/1

# GET by category
curl http://localhost:5000/api/products/category/Electronics

# POST new product (create)
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999,"stockQuantity":10,"category":"Electronics"}'

# PUT update product
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Desktop","price":1299,"stockQuantity":5,"category":"Electronics"}'

# PATCH update stock
curl -X PATCH http://localhost:5000/api/products/1/stock \
  -H "Content-Type: application/json" \
  -d '{"quantityAdjustment":5}'

# DELETE product
curl -X DELETE http://localhost:5000/api/products/1

# Save response to file
curl http://localhost:5000/api/products > products.json
```

---

## 🐳 Docker & Redis

```bash
# Start Redis container
docker run -d -p 6379:6379 --name my-redis redis:latest

# List containers
docker ps

# Stop container
docker stop my-redis

# Remove container
docker rm my-redis

# Connect to Redis CLI
redis-cli

# In Redis CLI:
PING              # Test connection
KEYS *            # List all keys
GET [key]         # Get value
SET [key] [value] # Set value
DEL [key]         # Delete key
FLUSHALL          # Clear all keys
EXIT              # Quit Redis CLI
```

---

## 📝 Logging Output

```bash
# View recent build output
dotnet build 2>&1 | tail -20

# Save build errors to file
dotnet build > build.log 2>&1

# Run with environment debugging
set DEBUG=true && dotnet run
```

---

## 🔍 Project Information

```bash
# Show .NET version
dotnet --version

# Show SDK versions
dotnet sdk list

# Show runtime versions
dotnet runtime list

# Show workload list
dotnet workload list

# Show project information
dotnet list package

# Show solution info
dotnet sln list

# Clean all build artifacts
dotnet clean
rm -r bin obj

# List files in project
dir

# Show project structure
tree /F /L 3
```

---

## 📍 Navigation

```bash
# Go to project directory
cd d:\dotnet-fullstack\ProductCatalogAPI-WebAPI-EFCore

# List files
dir

# Open in code editor
code .

# Open file
code filename.cs

# Show current directory
cd

# Go back to parent directory
cd ..

# Go to home directory
cd ~
```

---

## 🔧 Development Shortcuts

```bash
# Quick build-run cycle
dotnet build && dotnet run

# Build and show errors only
dotnet build 2>&1 | findstr "error"

# Find all TODO comments
findstr /S "TODO" *.cs

# Count lines of code
(gci -include *.cs -recurse | measure-object -line).lines

# Format code (if using EditorConfig)
dotnet format
```

---

## 🚨 Troubleshooting

```bash
# Port already in use (5000)
netstat -ano | findstr :5000
taskkill /PID [PID] /F

# Clear NuGet cache
dotnet nuget locals all --clear

# Reset project
dotnet clean
rm -r bin obj packages
dotnet restore

# Check solution integrity
dotnet sln list

# Rebuild everything
dotnet clean
dotnet build
dotnet run
```

---

## 🎮 Common Workflows

### Full Build & Test Cycle
```bash
cd d:\dotnet-fullstack\ProductCatalogAPI-WebAPI-EFCore
dotnet clean
dotnet build
dotnet run
# In another terminal:
curl http://localhost:5000/api/products
```

### Database Migration Workflow
```bash
# Make model changes
# Then:
dotnet ef migrations add DescriptiveNameHere
dotnet ef database update

# Check migration status
dotnet ef migrations list
```

### Deploy to Release
```bash
dotnet clean
dotnet build --configuration Release
dotnet publish --configuration Release

# Output in: bin/Release/net8.0/publish/
```

### Quick Debug
```bash
dotnet build
dotnet run
# Make request in another terminal
curl -i http://localhost:5000/api/products

# View console output in first terminal
# Shows HIT/MISS/invalidated logs
```

---

## 💡 Pro Tips

| Task | Command |
|------|---------|
| Quick rebuild | `dotnet build && dotnet run` |
| List all errors | `dotnet build 2>&1 | findstr "error"` |
| Check port | `netstat -ano \| findstr :5000` |
| Kill process | `taskkill /PID [PID] /F` |
| View logs | Look at console output while running |
| Add package | `dotnet add package [Name]` |
| New migration | `dotnet ef migrations add [Name]` |
| Update DB | `dotnet ef database update` |

---

## 📋 Cheatsheet Download

**Print this page:** Ctrl+P → Save as PDF

**Keep it handy** while you're coding!

---

**Pro Tip:** Add these as aliases in PowerShell for even faster workflow:

```powershell
# Add to PowerShell profile:
# code $PROFILE

# Then add:
Set-Alias -Name build -Value "dotnet build"
Set-Alias -Name run -Value "dotnet run"
Set-Alias -Name clean -Value "dotnet clean"

# Now you can just type: build, run, clean
```

---

**Bookmark this page for quick reference!** ⭐
