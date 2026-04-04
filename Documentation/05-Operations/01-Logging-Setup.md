# 📋 Logging Storage Guide - ProductCatalogAPI

Complete guide on where logs are stored and how to configure different log destinations.

---

## 📍 Current Log Location

### Default: Console Output

```
┌─────────────────────────────────────────────────────┐
│         YOUR APPLICATION CONSOLE/TERMINAL           │
│                                                     │
│  [22:30:15] Information: HTTP REQUEST:             │
│    Method: POST                                     │
│    Path: /api/products                              │
│                                                     │
│  [22:30:16] Information: HTTP RESPONSE:             │
│    StatusCode: 201                                  │
│                                                     │
│  [22:30:16] Information: ✓ Request completed       │
│    in 125ms                                         │
└─────────────────────────────────────────────────────┘
     OUTPUT APPEARS HERE WHEN YOU RUN: dotnet run
```

### Why Console?

In `Program.cs`, ASP.NET Core by default adds Console logging:

```csharp
var builder = WebApplication.CreateBuilder(args);
// This automatically adds:
//   - Console logging
//   - Debug logging (in Visual Studio)
//   - Event logging (Windows Event Viewer)
```

### How to See Logs

```bash
# Terminal 1: Start the API
cd ProductCatalogAPI-WebAPI-EFCore
dotnet run

# You should see output like:
# info: ProductCatalogAPI.Middleware.PerformanceMiddleware[0]
#      ✓ Request completed: GET /api/products [200] in 45ms

# Terminal 2: Make a request
curl http://localhost:5000/api/products

# Back to Terminal 1: Logs appear here!
```

---

## 🗂️ Log Storage Options

| Location | Setup | Pro | Con | Use Case |
|----------|-------|-----|-----|----------|
| **Console** | ✓ Default | Real-time, easy | Lost on restart | Development |
| **Text File** | Easy | Persists, searchable | Manual management | Development/Production |
| **Database** | Medium | Queryable, indexed | Overhead | Production |
| **Cloud (Azure/AWS)** | Advanced | Scalable, managed | Cost | Production |
| **ELK Stack** | Advanced | Powerful, distributed | Complex | Enterprise |

---

## 📄 Option 1: Text File Logging (Easiest)

### Step 1: Install Serilog NuGet Package

```bash
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.File
```

### Step 2: Update Program.cs

```csharp
using Serilog;

// Add at the very beginning (before builder)
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()  // Still log to console
    .WriteTo.File(
        path: "logs/productcatalog-.txt",  // File path pattern
        rollingInterval: RollingInterval.Day,  // New file each day
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
    )
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Add Serilog to the logging pipeline
builder.Host.UseSerilog();

// ... rest of Program.cs
```

### Step 3: Create Logs Directory

```bash
mkdir logs
```

### Step 4: Run and Check

```bash
dotnet run

# After running and making requests, check:
ls logs/

# You'll see:
# productcatalog-20260404.txt
# productcatalog-20260405.txt
# (one file per day, auto-rolling)
```

### Log File Content

**File: `logs/productcatalog-20260404.txt`**

```
2026-04-04 22:30:15.123 [INF] HTTP REQUEST:
  Method: POST
  Path: /api/products
  Body: {"name":"Laptop","price":999.99}

2026-04-04 22:30:15.500 [INF] HTTP RESPONSE:
  StatusCode: 201
  Body: {"id":1,"name":"Laptop"...}

2026-04-04 22:30:15.523 [INF] ✓ Request completed: POST /api/products [201] in 125ms

2026-04-04 22:35:20.050 [WRN] ⚠️ SLOW REQUEST DETECTED:
  Method: GET
  Path: /api/products/category/electronics
  ExecutionTime: 2500ms (threshold: 500ms)
```

### File Rotation (Rolling)

```
logs/
├── productcatalog-20260401.txt  ← Yesterday's log (old)
├── productcatalog-20260402.txt  ← Old
├── productcatalog-20260403.txt  ← Old
├── productcatalog-20260404.txt  ← Today's log (current)
└── productcatalog-20260405.txt  ← Tomorrow (starts tomorrow)

// Automatic: One file per day
// After 30 days: Oldest files auto-deleted (or you configure retention)
```

---

## 💾 Option 2: Database Logging

### Step 1: Install Serilog SQL Package

```bash
dotnet add package Serilog.Sinks.MSSqlServer
```

### Step 2: Create Logs Table

```bash
dotnet ef migrations add AddLogsTable
dotnet ef database update
```

Or run this SQL manually:

```sql
CREATE TABLE [Logs] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [MessageTemplate] NVARCHAR(MAX),
    [Level] VARCHAR(128),
    [TimeStamp] DATETIME2,
    [Exception] NVARCHAR(MAX),
    [LogEvent] NVARCHAR(MAX)  -- Full JSON
);

CREATE INDEX [IX_Logs_TimeStamp] ON [Logs] ([TimeStamp] DESC);
CREATE INDEX [IX_Logs_Level] ON [Logs] ([Level]);
```

### Step 3: Update Program.cs

```csharp
using Serilog;
using Serilog.Sinks.MSSqlServer;

var connectionString = "Server=AMAN;Database=ProductCatalogDB;Trusted_Connection=true;";

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()  // Console + Database
    .WriteTo.MSSqlServer(
        connectionString: connectionString,
        sinkOptions: new MSSqlServerSinkOptions
        {
            TableName = "Logs",
            SchemaName = "dbo",
            AutoCreateSqlTable = true  // Auto-create if not exists
        }
    )
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();

// ... rest of Program.cs
```

### Step 4: Query Logs from Database

```csharp
// In a controller or utility class
public async Task<List<LogEntry>> GetRecentLogs(int days = 1)
{
    var since = DateTime.UtcNow.AddDays(-days);

    return await _dbContext.Logs
        .Where(l => l.TimeStamp >= since)
        .OrderByDescending(l => l.TimeStamp)
        .ToListAsync();
}
```

### Benefits of Database Logging

```
✓ Query logs: SELECT * FROM Logs WHERE Level = 'Warning'
✓ Analyze: GROUP BY Level, PATH to find problematic areas
✓ Alert: Trigger when errors > 10 in last hour
✓ Audit trail: Full history, can't be lost
✓ Integration: Build dashboards on top
```

---

## ☁️ Option 3: Cloud Logging

### Option 3A: Azure Application Insights

**Step 1: Install NuGet Package**
```bash
dotnet add package Microsoft.ApplicationInsights.AspNetCore
dotnet add package Microsoft.ApplicationInsights.WindowsServer
```

**Step 2: Update Program.cs**
```csharp
var builder = WebApplication.CreateBuilder(args);

// Add Application Insights
builder.Services.AddApplicationInsightsTelemetry();

var app = builder.Build();
// ... rest
```

**Step 3: Configure Azure Portal**
- Create Application Insights resource
- Copy Instrumentation Key
- Add to appsettings.json or user secrets

**Result:**
- Logs appear in Azure Portal
- Real-time dashboards
- Performance analytics
- Automatic alerting

### Option 3B: AWS CloudWatch

**Step 1: Install AWS SDK**
```bash
dotnet add package AWS.Logger.AspNetCore
```

**Step 2: Add to appsettings.json**
```json
{
  "AWS": {
    "Logging": {
      "LogGroup": "/aws/productcatalogapi",
      "Region": "us-east-1"
    }
  }
}
```

**Step 3: Update Program.cs**
```csharp
builder.Logging.AddAWSProvider();
```

---

## 🔧 Option 4: Advanced Configuration

### Structured Logging with Serilog

```csharp
using Serilog;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()  // Add context data
    .Enrich.WithMachineName()  // Which server?
    .Enrich.WithProperty("Application", "ProductCatalogAPI")
    .WriteTo.Console()
    .WriteTo.File(
        "logs/productcatalog-.txt",
        rollingInterval: RollingInterval.Day,
        retained: 30,  // Keep 30 days
        fileSizeLimitBytes: 1_000_000,  // 1MB per file
        rollOnFileSizeLimit: true,
        shared: true
    )
    .CreateLogger();
```

### Custom Context

```csharp
// In middleware:
LogContext.PushProperty("UserId", context.User.FindFirst("sub"));
LogContext.PushProperty("CorrelationId", correlationId);

// Log automatically includes these:
_logger.LogInformation("Processing request");
// Output: Processing request - UserId: 123 - CorrelationId: abc-def
```

### Different Log Levels for Different Namespaces

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "ProductCatalogAPI.Middleware": "Debug",  // More details
      "ProductCatalogAPI.Services": "Information"
    }
  }
}
```

---

## 📊 Comparison: Where Do Logs Go?

### During Development (dotnet run)

```
┌─────────────────┐
│  Your Request   │
└────────┬────────┘
         │
    ┌────▼──────────────────────────┐
    │  Application Running           │
    │  (Console window showing logs) │
    └────┬─────────────────────────┬─┘
         │                         │
         ▼                         ▼
    [Console]               [Visual Studio Debug]
 (In terminal output)    (In Debug Output window)
```

**Path:** Terminal/Command Prompt window

---

### With File Logging

```
Application Running
    │
    ├─→ [Console Output]
    │   (Terminal window)
    │
    └─→ [Text Files]
        logs/productcatalog-20260404.txt  ← STORED HERE
```

**Path:** `d:\dotnet-fullStack\ProductCatalogAPI-WebAPI-EFCore\logs\`

---

### With Database Logging

```
Application Running
    │
    ├─→ [Console Output]
    │   (Terminal window)
    │
    └─→ [SQL Server]
        ProductCatalogDB.dbo.Logs  ← STORED HERE

        Can query: SELECT * FROM Logs WHERE TimeStamp > ...
```

**Path:** SQL Server database table

---

### With Cloud Logging

```
Application Running
    │
    ├─→ [Console Output]
    │
    └─→ [Cloud Provider]
        Azure / AWS / GCP  ← STORED HERE

        Accessible via web portal
        Real-time dashboard
```

**Path:** Cloud provider dashboard

---

## 🎯 Quick Start: File Logging (Recommended for Learning)

### Complete Working Example

**File: Program.cs**

```csharp
using Serilog;

// 1. Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()  // Terminal
    .WriteTo.File(
        path: "logs/app-.txt",
        rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
    )
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// 2. Use Serilog at BUILDER stage
builder.Host.UseSerilog();

// ... rest of configuration
var app = builder.Build();

// ... rest of pipeline
app.Run();
```

### Verify It Works

```bash
# Step 1: Install Serilog
dotnet add package Serilog.AspNetCore Serilog.Sinks.File

# Step 2: Update Program.cs (code above)

# Step 3: Build
dotnet build

# Step 4: Run
dotnet run

# Step 5: Make requests in another terminal
curl http://localhost:5000/api/products

# Step 6: Check logs directory
ls logs/
# Output: app-20260404.txt

# Step 7: View logs
cat logs/app-20260404.txt
# Output: 2026-04-04 22:30:15.123 [INF] HTTP REQUEST...
```

---

## 📍 File System Paths

### Default Locations

```
Windows: C:\Users\[YourUsername]\[ProjectFolder]\logs\
Example: C:\Users\amana\dotnet-fullStack\ProductCatalogAPI-WebAPI-EFCore\logs\

Linux: /home/[user]/[project]/logs/
Mac: /Users/[user]/[project]/logs/
```

### Create Logs Directory

```bash
# Create automatically with Serilog
# Just run dotnet run, Serilog creates if missing

# Or manually create:
mkdir logs
```

### File Name Pattern

```
path: "logs/app-.txt"

Generates:
  app-20260404.txt    (April 4)
  app-20260405.txt    (April 5)
  app-20260406.txt    (April 6)
  (one file per day)
```

---

## 🔍 How to View Logs

### Quick Commands

```bash
# View latest 50 lines
tail -50 logs/app-20260404.txt

# View all logs
cat logs/app-20260404.txt

# Search for specific text
grep "SLOW REQUEST" logs/*.txt

# Count errors
grep "\[ERR\]" logs/*.txt | wc -l

# Watch in real-time (follow)
tail -f logs/app-$(date +%Y%m%d).txt
```

### In Windows PowerShell

```powershell
# View latest file
Get-Content logs\app-*.txt -Tail 50

# Follow along
Get-Content logs\app-*.txt -Wait

# Search
Select-String "SLOW REQUEST" logs\*.txt
```

---

## 📈 Log Volume Example

### Typical Daily Volume

```
Morning (9 AM - 5 PM):
  500 requests/day
  × 0.5KB per request (average)
  = 250KB/day

File size:
  10 days = ~2.5MB
  30 days = ~7.5MB
  90 days = ~22.5MB
```

### Rotate/Archive Old Logs

```csharp
// Serilog auto-cleanup
.WriteTo.File(
    path: "logs/app-.txt",
    rollingInterval: RollingInterval.Day,
    retained: 30,  // Keep only 30 days
    fileSizeLimitBytes: 5_000_000  // 5MB per file
)
// Files older than 30 days auto-deleted
```

---

## ⚡ Production Best Practices

### 1. Environment-Based Configuration

```json
// appsettings.Development.json
{
  "Logging": {
    "LogLevel": { "Default": "Debug" }
  }
}

// appsettings.Production.json
{
  "Logging": {
    "LogLevel": { "Default": "Warning" }
  }
}
```

### 2. Sensitive Data Masking

```csharp
// Before logging body
var sanitized = body
    .Replace("\"password\":", "\"password\":\"***\"")
    .Replace("\"token\":", "\"token\":\"***\"");

_logger.LogInformation("Request: {Body}", sanitized);
```

### 3. Structured Queries

```sql
-- Find all slow requests
SELECT
    TimeStamp,
    MessageTemplate,
    [Path],
    ExecutionTimeMs
FROM Logs
WHERE MessageTemplate LIKE '%SLOW REQUEST%'
  AND TimeStamp > DATEADD(day, -7, GETUTCDATE())
ORDER BY ExecutionTimeMs DESC;

-- Count errors by hour
SELECT
    DATEPART(HOUR, TimeStamp) as Hour,
    COUNT(*) as ErrorCount
FROM Logs
WHERE Level = 'Error'
  AND TimeStamp > DATEADD(day, -1, GETUTCDATE())
GROUP BY DATEPART(HOUR, TimeStamp)
ORDER BY Hour;
```

### 4. Alerting

```csharp
// Alert if too many errors
var errorCount = await _dbContext.Logs
    .Where(l => l.Level == "Error" && l.TimeStamp > DateTime.UtcNow.AddHours(-1))
    .CountAsync();

if (errorCount > 10)
{
    await _alertService.SendAlertAsync("Too many errors in last hour!");
}
```

---

## 🎯 Recommendation for Your Setup

**For Learning & Development:**
```
✓ Use Console (default)
  Easy to see logs instantly
  No file management needed
```

**For Running Locally Long-term:**
```
✓ Add File Logging (Serilog)
  Persists after restart
  Easy to search/review
  Minimal setup
```

**For Production:**
```
✓ Database Logging + Cloud Backup
  Queryable for analytics
  Secure storage
  Automated alerts
```

**For Enterprise:**
```
✓ ELK Stack or Cloud Provider
  Centralized logging
  Real-time dashboards
  Advanced analytics
```

---

## 📚 Related Topics

- **Log Levels:** Debug < Info < Warning < Error < Critical
- **Correlation IDs:** Track requests across services
- **Structured Logging:** Query logs programmatically
- **Log Aggregation:** Combine logs from multiple servers
- **Security:** Sensitive data masking in logs

---

**Last Updated:** 2026-04-04
**Next:** Implement file logging with `dotnet add package Serilog.AspNetCore`
