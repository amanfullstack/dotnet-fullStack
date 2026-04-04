using System.Diagnostics;

namespace ProductCatalogAPI.Middleware;

/*
 * IMPORTANT FLOW #1: REQUEST PERFORMANCE TRACKING MIDDLEWARE
 *
 * Purpose: Measure how long each request takes and log slow requests
 *
 * Why it's important:
 *   ✓ Performance monitoring: Identify slow endpoints
 *   ✓ Bottleneck detection: Find database queries taking too long
 *   ✓ Optimization: Know which endpoints to optimize first
 *   ✓ SLA tracking: Ensure responses meet performance targets
 *   ✓ User experience: Identify what makes users wait
 *
 * Real-world example:
 *   - Get Products: 5ms   ✓ Fast
 *   - Get Product by ID with reviews: 2000ms ✗ Slow
 *   - Create Order: 500ms ✓ Acceptable
 *   - Delete Product: 50ms ✓ Fast
 *
 * Using Stopwatch:
 *   - High-resolution timer
 *   - Accurate to microseconds
 *   - Perfect for measuring code execution time
 */

public class PerformanceMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<PerformanceMiddleware> _logger;

    // IMPORTANT: Configurable threshold for slow requests
    // Requests taking longer than this are logged as warnings
    private const int SlowRequestThresholdMs = 500;

    public PerformanceMiddleware(RequestDelegate next, ILogger<PerformanceMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /*
     * IMPORTANT FLOW #2: MEASURING REQUEST TIME
     *
     * Steps:
     *   1. Create stopwatch (start timer)
     *   2. Call next middleware (let request process)
     *   3. Stop stopwatch (end timer)
     *   4. Calculate elapsed milliseconds
     *   5. Log based on threshold:
     *      - If fast: Log at Information level
     *      - If slow: Log at Warning level (alerts to performance issue)
     */
    public async Task InvokeAsync(HttpContext context)
    {
        // IMPORTANT: Create stopwatch
        // Stopwatch measures high-resolution time
        // Start() begins timing, Stop() ends timing
        var stopwatch = Stopwatch.StartNew();

        try
        {
            // IMPORTANT: Call next middleware
            // Everything between _next call and stopwatch stop is what we're measuring
            await _next(context);
        }
        finally
        {
            // IMPORTANT: Stop stopwatch (must be in finally to measure even if exception occurs)
            // finally block runs regardless of success/exception
            stopwatch.Stop();

            // IMPORTANT: Get elapsed time in milliseconds
            var elapsedMilliseconds = stopwatch.ElapsedMilliseconds;

            // IMPORTANT: Log performance based on threshold
            // Determine what's "slow" for your application
            if (elapsedMilliseconds > SlowRequestThresholdMs)
            {
                // IMPORTANT: Log slow requests at Warning level
                // Warnings alert developers that something might be wrong
                _logger.LogWarning("""
                    ⚠️ SLOW REQUEST DETECTED:
                      Method: {Method}
                      Path: {Path}
                      StatusCode: {StatusCode}
                      ExecutionTime: {ElapsedMilliseconds}ms (threshold: {Threshold}ms)
                    """,
                    context.Request.Method,
                    context.Request.Path,
                    context.Response.StatusCode,
                    elapsedMilliseconds,
                    SlowRequestThresholdMs
                );
            }
            else
            {
                // IMPORTANT: Log normal requests at Information level
                // These are expected, don't need urgent attention
                _logger.LogInformation(
                    "✓ Request completed: {Method} {Path} [{StatusCode}] in {ElapsedMilliseconds}ms",
                    context.Request.Method,
                    context.Request.Path,
                    context.Response.StatusCode,
                    elapsedMilliseconds
                );
            }
        }
    }
}

/*
 * IMPORTANT FLOW #3: STOPWATCH BEHAVIOR
 *
 * What Stopwatch measures:
 *   ✓ Wall-clock time (real time that passes)
 *   ✓ CPU time (how long CPU worked on this request)
 *   ✓ I/O wait time (time spent waiting for database, network, disk)
 *
 * Example breakdown of 2000ms request:
 *   - CPU processing: 100ms (business logic, serialization)
 *   - Database query: 1800ms (waiting for SQL Server response)
 *   - I/O operations: 100ms (reading/writing files)
 *   Total: 2000ms ✗ Slow
 *
 * Finding the bottleneck:
 *   - Database took 1800ms → Optimize SQL query, add index
 *   - Business logic took 100ms → OK
 *
 * Why finally block?
 *   - Ensures stopwatch stops even if exception is thrown
 *   - Captures timing for failed requests too
 *   - Important for monitoring error handling performance
 */

/*
 * IMPORTANT FLOW #4: LOGGING STRUCTURE
 *
 * Information level (fast requests):
 *   - Used for normal operations
 *   - High volume (one per request)
 *   - Minimal alert value, logged for audit trail
 *
 * Warning level (slow requests):
 *   - Used when something might be wrong
 *   - Lower volume (only when threshold exceeded)
 *   - Demands attention - something needs optimization
 *   - Developers should investigate
 *
 * Configuration in appsettings.json:
 *   "LogLevel": {
 *     "Default": "Information"  ← Both Infirmation & Warning logged
 *   }
 *
 * If you want ONLY warnings:
 *   "LogLevel": {
 *     "Default": "Warning"  ← Information ignored, Warning shown
 *   }
 */

/*
 * IMPORTANT FLOW #5: CONFIGURABLE THRESHOLD
 *
 * Why make it configurable?
 *   - Different endpoints have different expectations
 *   - API might accept slower times than UI
 *   - Different during peak vs off-peak hours
 *   - May change as application scales
 *
 * Current: 500ms threshold (SlowRequestThresholdMs)
 *
 * Better approach (for production):
 *   1. Read threshold from appsettings.json
 *   2. Per-endpoint thresholds in attributes
 *   3. Dynamic thresholds based on time of day
 *
 * Example advanced pattern:
 *   [PerformanceThreshold(1000)]  // 1 second for this endpoint
 *   public async Task<ActionResult<Product>> GetProductWithReviews(int id)
 *   { ... }
 */

/*
 * IMPORTANT FLOW #6: REAL-WORLD USES
 *
 * Scenario 1: Morning slowdown
 *   - Logs show Get Products endpoint slow at 9 AM
 *   - Investigation: Database backup runs at 9 AM
 *   - Solution: Schedule backup at 2 AM
 *
 * Scenario 2: Memory leak
 *   - Logs show all requests getting slower over time
 *   - Investigation: Memory usage increasing
 *   - Solution: Find object not being garbage collected
 *
 * Scenario 3: N+1 Query Problem
 *   - Get Products takes 5 seconds
 *   - Get individual products take 10ms each
 *   - Clue: 5000ms / 100 products = N+1 queries
 *   - Solution: Use eager loading instead of lazy loading
 *
 * Scenario 4: Misconfigured index
 *   - Get by category slow after database migration
 *   - Investigation: Category index missing after migration
 *   - Solution: Re-create index
 */
