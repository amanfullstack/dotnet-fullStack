# 🔧 Custom Middleware Guide - ProductCatalogAPI

Complete guide to the three custom middleware implementations in this project.

---

## 📋 Table of Contents

1. [What is Middleware?](#what-is-middleware)
2. [Middleware Pipeline](#middleware-pipeline)
3. [Three Custom Middleware](#three-custom-middleware)
4. [Implementation Details](#implementation-details)
5. [How to Test](#how-to-test)
6. [Common Patterns](#common-patterns)
7. [Production Considerations](#production-considerations)

---

## 🎯 What is Middleware?

Middleware is software that acts as an intermediary between the client request and your application logic.

### Analogy: Security Checkpoints

```
Client Request
    ↓
[Checkpoint 1] ← Middleware #1 (Check for threats)
    ↓
[Checkpoint 2] ← Middleware #2 (Check credentials)
    ↓
[Checkpoint 3] ← Middleware #3 (Log entry)
    ↓
[Terminal] ← Your Application (Process request)
    ↓
[Checkpoint 3] ← Middleware #3 (Log exit)
    ↓
[Checkpoint 2] ← Middleware #2 (Clean up)
    ↓
[Checkpoint 1] ← Middleware #1 (Final response)
    ↓
Client Response
```

### Key Characteristics

```csharp
public class ExampleMiddleware
{
    private readonly RequestDelegate _next;  // ← Next middleware in chain
    private readonly ILogger _logger;

    public ExampleMiddleware(RequestDelegate next, ILogger logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // BEFORE: Pre-processing (before downstream middleware/endpoint)
        // ...

        // CALL: Next middleware in pipeline
        await _next(context);

        // AFTER: Post-processing (after response is generated)
        // ...
    }
}
```

---

## 🔄 Middleware Pipeline

### Registration Order (Program.cs)

```csharp
// Order MATTERS! Request flows through in this order:
app.UseMiddleware<GlobalErrorHandlingMiddleware>();  // 1st
app.UseMiddleware<RequestLoggingMiddleware>();       // 2nd
app.UseMiddleware<PerformanceMiddleware>();          // 3rd
app.UseSwagger();                                      // 4th
app.UseCors("AllowFrontend");                          // 5th
app.MapControllers();                                  // 6th (endpoint)
```

### Request Flow Diagram

```
CLIENT SENDS REQUEST
    ↓
======== REQUEST PHASE (→ direction) ========
    ↓
[1. GlobalErrorHandler]  → Wraps next middleware with try-catch
    ↓
[2. RequestLogger]  → Logs incoming request, captures response stream
    ↓
[3. Performance]  → Starts stopwatch
    ↓
[4. Swagger]  → Routes /swagger requests
    ↓
[5. CORS]  → Validates origin
    ↓
[6. Controllers]  → Processes API endpoint
    ↓
======== RESPONSE PHASE (← direction) ========
    ↓
[3. Performance]  → Stops stopwatch, logs time
    ↓
[2. RequestLogger]  → Logs response
    ↓
[1. GlobalErrorHandler]  → No exceptions, pass through
    ↓
CLIENT RECEIVES RESPONSE
```

### Exception Flow

```
Controller throws exception
    ↓
[3. Performance] → Not yet, doesn't catch
    ↓
[2. RequestLogger] → Not yet, doesn't catch
    ↓
[1. GlobalErrorHandler] ← CATCHES HERE ✓
    ↓
Formats error response
    ↓
Returns JSON error to client
```

---

## 🛠️ Three Custom Middleware

### 1️⃣ Global Error Handling Middleware

**File:** `Middleware/GlobalErrorHandlingMiddleware.cs`

**Purpose:** Catch all unhandled exceptions and return consistent error responses

**What it does:**
```
Exception thrown
    ↓
Try-Catch wraps next middleware
    ↓
If exception occurs:
    - Catches it
    - Maps to HTTP status code (400, 404, 500, etc.)
    - Logs full error with stack trace
    - Returns JSON error to client (without sensitive details)
```

**Example:**

```csharp
// Thrown in controller
throw new KeyNotFoundException("Product not found");

// Middleware catches and returns:
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "status": 404,
  "message": "Resource not found.",
  "detail": "Product not found"
}
```

**Benefits:**
- ✅ Prevents stack traces from leaking to clients
- ✅ Consistent error format across all endpoints
- ✅ All errors logged for debugging
- ✅ Improves security (no implementation details exposed)
- ✅ Better user experience (friendly error messages)

**Exception Mapping:**

| Exception | HTTP Status | Message |
|-----------|-------------|---------|
| `ArgumentException` | 400 Bad Request | Invalid argument |
| `KeyNotFoundException` | 404 Not Found | Resource not found |
| `UnauthorizedAccessException` | 403 Forbidden | Access denied |
| `Generic Exception` | 500 Internal Server Error | Internal server error |

---

### 2️⃣ Request Logging Middleware

**File:** `Middleware/RequestLoggingMiddleware.cs`

**Purpose:** Log all incoming requests and outgoing responses

**What it does:**
```
Request arrives
    ↓
Log request details:
  - Method (GET, POST, PUT, etc.)
  - Path (/api/products)
  - Query string (?category=electronics)
  - Body (JSON data)
  - Headers (Content-Type, etc.)
    ↓
Call next middleware (endpoint processes)
    ↓
Capture response
Log response details:
  - Status code (200, 404, 500)
  - Response body
  - Headers
    ↓
Return response to client
```

**Example Log Output:**

```
[22:30:15] Information: HTTP REQUEST:
  Method: POST
  Path: /api/products
  QueryString:
  ContentType: application/json
  Body: {"name":"Laptop","price":999.99}

[22:30:15] Information: HTTP RESPONSE:
  StatusCode: 201
  ContentType: application/json
  Body: {"id":1,"name":"Laptop","price":999.99,...}
```

**Technical Challenge & Solution:**

```
Problem: Request/response bodies are streams
Streams can only be read ONCE

Solution:
  1. Enable buffering on request
     → Allows reading multiple times

  2. Capture response stream
     → Replace with memory stream
     → Memory stream = array in RAM
     → Can read multiple times

  3. Copy memory stream to original
     → Response still goes to client
     → Nothing lost
```

**Benefits:**
- ✅ Audit trail of all API activity
- ✅ Debugging: see exactly what was sent/received
- ✅ Security: detect suspicious requests
- ✅ Compliance: meet logging requirements
- ✅ Performance analysis: understand usage patterns

---

### 3️⃣ Performance Middleware

**File:** `Middleware/PerformanceMiddleware.cs`

**Purpose:** Measure request execution time and alert on slow requests

**What it does:**
```
Request arrives
    ↓
Start stopwatch ⏱️
    ↓
Call next middleware (endpoint processes)
    ↓
Stop stopwatch ⏱️
    ↓
Calculate elapsed time
    ↓
If time > 500ms:
  → Log at WARNING level (slow!)
Else:
  → Log at INFORMATION level (normal)
    ↓
Return response to client
```

**Example Log Output:**

```
[22:30:15] Information: ✓ Request completed:
  GET /api/products [200] in 45ms

[22:30:20] Warning: ⚠️ SLOW REQUEST DETECTED:
  Method: GET
  Path: /api/products/category/electronics
  StatusCode: 200
  ExecutionTime: 2500ms (threshold: 500ms)
  → Need to investigate!
```

**How Stopwatch Works:**

```csharp
var stopwatch = Stopwatch.StartNew();  // ← Start timing

// Do something...
await _next(context);

stopwatch.Stop();  // ← Stop timing
var ms = stopwatch.ElapsedMilliseconds;  // ← 45ms, 2500ms, etc.
```

**Time Breakdown (2500ms request):**

```
Total: 2500ms
  ├─ Business logic: 100ms (validation, mapping)
  ├─ Database query: 2300ms ← BOTTLENECK!
  └─ Serialization: 100ms
```

**Benefits:**
- ✅ Find performance bottlenecks
- ✅ Identify slow database queries
- ✅ Monitor N+1 query problems
- ✅ Alert on regressions
- ✅ Track performance over time
- ✅ SLA compliance monitoring

**Why using finally block?**

```csharp
try
{
    await _next(context);  // Exception here?
}
finally
{
    stopwatch.Stop();  // ← Runs regardless (even if exception)
    // Log performance metrics
}
```

Ensures timing is captured even if endpoint throws exception.

---

## 🔍 Implementation Details

### GlobalErrorHandlingMiddleware

```csharp
public async Task InvokeAsync(HttpContext context)
{
    try
    {
        // ← Request/response happens here
        await _next(context);

        // ← If we get here, no exception occurred
    }
    catch (Exception exception)
    {
        // ← Any exception from downstream is caught here
        _logger.LogError(exception, "Unhandled exception");

        // Format error response based on exception type
        var response = exception switch
        {
            ArgumentException => (400, "Invalid argument"),
            KeyNotFoundException => (404, "Not found"),
            _ => (500, "Internal error")
        };

        // Send error to client
        context.Response.StatusCode = response.Item1;
        await context.Response.WriteAsJsonAsync(response.Item2);
    }
}
```

### RequestLoggingMiddleware - Stream Challenge

```csharp
// REQUEST: Log request body
context.Request.EnableBuffering();  // Allow reading multiple times
context.Request.Body.Position = 0;  // Read from start
var body = await reader.ReadToEndAsync();
context.Request.Body.Position = 0;  // Reset for endpoint

// RESPONSE: Body can only be read once!
var originalBodyStream = context.Response.Body;
using (var responseBody = new MemoryStream())  // In-memory copy
{
    context.Response.Body = responseBody;  // Replace temporarily

    await _next(context);  // Endpoint writes to memory stream

    responseBody.Position = 0;
    var responseText = await reader.ReadToEndAsync();
    _logger.LogInformation("Response: {Body}", responseText);

    responseBody.Position = 0;
    await responseBody.CopyToAsync(originalBodyStream);  // Send to client
}
```

### PerformanceMiddleware - Timing Logic

```csharp
const int SlowThreshold = 500;

var stopwatch = Stopwatch.StartNew();
try
{
    await _next(context);
}
finally
{
    stopwatch.Stop();
    var ms = stopwatch.ElapsedMilliseconds;

    if (ms > SlowThreshold)
    {
        _logger.LogWarning("SLOW: {Path} took {Ms}ms",
            context.Request.Path, ms);
    }
    else
    {
        _logger.LogInformation("✓ {Path} in {Ms}ms",
            context.Request.Path, ms);
    }
}
```

---

## 📊 How to Test

### Test 1: Global Error Handling

**Test a valid request:**
```bash
curl -X GET http://localhost:5000/api/products
# Expected: 200 OK with products list
```

**Test error handling (non-existent product):**
```bash
curl -X GET http://localhost:5000/api/products/99999
# Expected: 404 Not Found with error JSON
# {
#   "status": 404,
#   "message": "Resource not found.",
#   "detail": "Product with id 99999 not found"
# }
```

**Test bad request:**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"price": "not-a-number"}'
# Expected: 400 Bad Request with validation error
```

### Test 2: Request Logging

**Watch logs while making request:**
```bash
# Terminal 1: Start API with logs visible
dotnet run

# Terminal 2: Make request
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"New Product","price":99.99}'

# Terminal 1 output should show:
# Information: HTTP REQUEST:
#   Method: POST
#   Path: /api/products
#   Body: {"name":"New Product","price":99.99}
# Information: HTTP RESPONSE:
#   StatusCode: 201
#   Body: {"id":X,"name":"New Product",...}
```

### Test 3: Performance Middleware

**Make fast request (should show ✓):**
```bash
curl -X GET http://localhost:5000/api/products
# Expected log: ✓ Request completed: GET /api/products [200] in 25ms
```

**Simulate slow request (for testing):**

Edit `ProductService.cs` temporarily to add delay:
```csharp
public async Task<List<Product>> GetAllProductsAsync()
{
    await Task.Delay(600);  // Simulate slow operation
    return await _dbContext.Products
        .Where(p => p.IsActive)
        .ToListAsync();
}
```

Then request:
```bash
curl -X GET http://localhost:5000/api/products
# Expected log: ⚠️ SLOW REQUEST DETECTED: GET /api/products [200] in 625ms
```

---

## 📋 Common Patterns

### Pattern 1: Add Headers Middleware

```csharp
public class CustomHeaderMiddleware
{
    private readonly RequestDelegate _next;

    public CustomHeaderMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        // Add custom header to response
        context.Response.Headers.Add("X-Powered-By", "ProductCatalogAPI");
        context.Response.Headers.Add("X-Request-Id", Guid.NewGuid().ToString());

        await _next(context);
    }
}

// Usage in Program.cs:
// app.UseMiddleware<CustomHeaderMiddleware>();
```

### Pattern 2: Correlation ID Middleware

```csharp
public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, ILogger<CorrelationIdMiddleware> logger)
    {
        var correlationId = context.Request.Headers
            .FirstOrDefault(x => x.Key == "X-Correlation-Id").Value;

        if (string.IsNullOrEmpty(correlationId))
        {
            correlationId = Guid.NewGuid().ToString();
        }

        context.Items["CorrelationId"] = correlationId;
        context.Response.Headers.Add("X-Correlation-Id", correlationId);

        logger.LogInformation("Request {CorrelationId} started", correlationId);

        await _next(context);

        logger.LogInformation("Request {CorrelationId} completed", correlationId);
    }
}
```

### Pattern 3: Authentication Middleware

```csharp
public class ApiKeyMiddleware
{
    private readonly RequestDelegate _next;
    private const string ApiKeyHeader = "X-API-Key";

    public ApiKeyMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip for swagger
        if (context.Request.Path.StartsWithSegments("/swagger"))
        {
            await _next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue(ApiKeyHeader, out var apiKey))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("API Key is missing");
            return;
        }

        if (apiKey != "your-secret-key")
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsync("Invalid API Key");
            return;
        }

        await _next(context);
    }
}
```

---

## ⚙️ Production Considerations

### 1. Performance Impact

```
Current logging middleware reads FULL request/response bodies:
  - Extra memory allocation
  - Extra CPU (JSON parsing)
  - Extra disk I/O (writing logs)

Production optimization:
  ✓ Log only headers (not bodies)
  ✓ Exclude /health endpoints
  ✓ Sample requests (log 1 in 100)
  ✓ Different log levels by endpoint
  ✓ Async logging with queue
```

### 2. Security

```
Current logging includes:
  - User passwords (in POST bodies)
  - Authorization tokens
  - Personal information

Production must:
  ✓ Sanitize sensitive data
  ✓ Never log passwords
  ✓ Mask tokens
  ✓ Encrypt logs
  ✓ Limit who can view logs
```

### 3. Monitoring

```
Current logging to Console:
  - Works for development
  - Lost when application restarts

Production should use:
  ✓ Centralized logging (ELK, CloudWatch, Application Insights)
  ✓ Alert when thresholds exceeded
  ✓ Dashboard showing metrics
  ✓ Historical data retention
  ✓ Full-text search across logs
```

### 4. Configuration

```csharp
// appsettings.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "ProductCatalogAPI.Middleware": "Warning"  // Reduce middleware logging
    }
  },
  "Performance": {
    "SlowRequestThresholdMs": 1000  // Configurable threshold
  }
}
```

---

## 🎓 Key Learning Points

**Middleware Order:**
- Early middleware wraps later middleware (catches exceptions)
- Request → First middleware → Last middleware → Endpoint
- Response → Last middleware → First middleware → Client

**Stream Handling:**
- Streams can only be read once
- Solution: Enable buffering or use memory streams
- Important: Always reset Position after reading

**Exception Handling:**
- Put try-catch in outer middleware to catch inner exceptions
- Use finally for cleanup (timing, resources)
- Never expose internal errors to client

**Performance Tracking:**
- Use Stopwatch for microsecond accuracy
- Use finally block to ensure timing on errors
- Compare against threshold to identify bottlenecks

**Logging:**
- Different levels: Trace < Debug < Information < Warning < Error < Critical
- Use appropriate level (Warning for potential issues)
- Structure logs for parsing (JSON, key=value)

---

## 📚 Related Middleware

Consider adding in future:

- **HTTPS Rewrite Middleware** - Force HTTPS in production
- **Rate Limiting Middleware** - Prevent abuse (100 req/min)
- **Compression Middleware** - GZip responses
- **Static Files Middleware** - Serve CSS, JS, images
- **Route Logging Middleware** - Which routes are most used
- **Cache Control Middleware** - Set cache headers
- **Security Headers Middleware** - Add security headers (CSP, XSS)

---

**Last Updated:** 2026-04-04
**Applicable To:** ProductCatalogAPI-WebAPI-EFCore & similar projects
