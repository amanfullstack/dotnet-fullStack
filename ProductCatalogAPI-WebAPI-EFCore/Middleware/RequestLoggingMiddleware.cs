namespace ProductCatalogAPI.Middleware;

/*
 * IMPORTANT FLOW #1: REQUEST/RESPONSE LOGGING MIDDLEWARE
 *
 * Purpose: Log all incoming requests and outgoing responses for debugging and monitoring
 *
 * Why it's important:
 *   ✓ Audit trail: See what requests came in and what responses were sent
 *   ✓ Debugging: Quickly identify problematic requests
 *   ✓ Performance analysis: Track request patterns
 *   ✓ Security: Log suspicious requests
 *   ✓ Troubleshooting: Understand what happened during a timeframe
 *
 * What gets logged:
 *   - Request: Method, Path, QueryString, Body (if present)
 *   - Response: StatusCode, Body (if present)
 *   - HTTP details: Headers, Content-Type
 *
 * Flow:
 *   1. Request arrives
 *   2. Log incoming request details
 *   3. Capture response stream (because it can only be read once)
 *   4. Call next middleware
 *   5. Log response details
 *   6. Return response to client
 */

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /*
     * IMPORTANT FLOW #2: REQUEST/RESPONSE LOGGING
     *
     * Challenge: We need to read request/response body, but streams can only be read once.
     *
     * Solution:
     *   1. Enable buffering on request (allows multiple reads)
     *   2. Capture original response stream
     *   3. Replace with memory stream (so we can read it)
     *   4. After response, copy memory stream back to original
     *
     * This ensures:
     *   ✓ We can read body for logging
     *   ✓ Client still gets the response
     *   ✓ No data is lost
     */
    public async Task InvokeAsync(HttpContext context)
    {
        // IMPORTANT: Enable buffering so request body can be read multiple times
        // By default, request stream can only be read once
        context.Request.EnableBuffering();

        // IMPORTANT: Log request details
        await LogRequestAsync(context);

        // IMPORTANT: Capture original response stream
        // We need to replace it temporarily to capture the response body
        var originalBodyStream = context.Response.Body;

        // IMPORTANT: Create memory stream to capture response
        // Memory stream allows us to read/write multiple times (unlike network stream)
        using (var responseBody = new MemoryStream())
        {
            // IMPORTANT: Replace response stream temporarily
            context.Response.Body = responseBody;

            try
            {
                // IMPORTANT: Call next middleware in pipeline
                // This is where response gets generated
                await _next(context);
            }
            finally
            {
                // IMPORTANT: Log response details
                await LogResponseAsync(context, responseBody);

                // IMPORTANT: Copy captured response back to original stream
                // This sends the response to the client
                await responseBody.CopyToAsync(originalBodyStream);
            }
        }
    }

    /*
     * IMPORTANT FLOW #3: LOG INCOMING REQUEST
     *
     * Logs:
     *   - HTTP method (GET, POST, etc.)
     *   - Request path (URI)
     *   - Query parameters (if any)
     *   - Request body (for debugging POST/PUT requests)
     *   - Content-Type header
     *   - Request headers (optional: user-agent, etc.)
     */
    private async Task LogRequestAsync(HttpContext context)
    {
        // Reset stream position so we can read from beginning
        context.Request.Body.Position = 0;

        // Read request body (if it exists)
        // Some requests like GET might not have a body
        var requestBody = string.Empty;
        if (context.Request.ContentLength > 0)
        {
            using (var reader = new StreamReader(context.Request.Body, leaveOpen: true))
            {
                requestBody = await reader.ReadToEndAsync();
            }
            // Reset stream so endpoint can read it again
            context.Request.Body.Position = 0;
        }

        // IMPORTANT: Log request information
        _logger.LogInformation("""
            HTTP REQUEST:
              Method: {Method}
              Path: {Path}
              QueryString: {QueryString}
              ContentType: {ContentType}
              Body: {RequestBody}
            """,
            context.Request.Method,
            context.Request.Path,
            context.Request.QueryString,
            context.Request.ContentType,
            string.IsNullOrEmpty(requestBody) ? "(empty)" : requestBody
        );
    }

    /*
     * IMPORTANT FLOW #4: LOG OUTGOING RESPONSE
     *
     * Logs:
     *   - HTTP status code (200, 404, 500, etc.)
     *   - Response body (what we're sending back)
     *   - Response headers (Content-Type, etc.)
     *   - Any cookies being set
     */
    private async Task LogResponseAsync(HttpContext context, MemoryStream responseBody)
    {
        // Reset stream position to read from beginning
        responseBody.Position = 0;

        // Read response body
        using (var reader = new StreamReader(responseBody, leaveOpen: true))
        {
            var responseBodyText = await reader.ReadToEndAsync();

            // IMPORTANT: Log response information
            _logger.LogInformation("""
                HTTP RESPONSE:
                  StatusCode: {StatusCode}
                  ContentType: {ContentType}
                  Body: {ResponseBody}
                """,
                context.Response.StatusCode,
                context.Response.ContentType,
                string.IsNullOrEmpty(responseBodyText) ? "(empty)" : responseBodyText
            );
        }

        // Reset stream position so response can be sent to client
        responseBody.Position = 0;
    }
}

/*
 * IMPORTANT FLOW #5: LOGGING LEVELS
 *
 * Different logging levels for different severity:
 *
 *   Trace    - Most detailed, rarely used
 *   Debug    - Development debugging info
 *   Information ✓ - Important events (default level)
 *   Warning  - Potentially harmful situations
 *   Error    - Error events
 *   Critical - Critical failure events
 *   None     - No logging
 *
 * In appsettings.json:
 *   "LogLevel": {
 *     "Default": "Information",          ← RequestLogging uses Information
 *     "Microsoft.AspNetCore": "Warning"  ← Framework logs at Warning level
 *   }
 */

/*
 * IMPORTANT FLOW #6: PERFORMANCE NOTE
 *
 * Warning: Logging full request/response bodies can be expensive:
 *   - Memory usage: Multiple string copies
 *   - CPU usage: JSON serialization/deserialization
 *   - I/O Usage: Writing to log file/database
 *   - Network: If logging to central system
 *
 * For production, consider:
 *   ✓ Log only headers (not full body)
 *   ✓ Log body only if size < X bytes
 *   ✓ Add option to enable/disable body logging
 *   ✓ Sample requests (log 1 in 100)
 *
 * For now (learning environment):
 *   ✓ Log everything for debugging
 *   ✓ Useful to understand request/response flow
 */
