using System.Net;
using System.Text.Json;

namespace ProductCatalogAPI.Middleware;

/*
 * IMPORTANT FLOW #1: GLOBAL ERROR HANDLING MIDDLEWARE
 *
 * Purpose: Catch ALL unhandled exceptions in the API and return consistent error responses
 *
 * Why it's important:
 *   ✓ Prevents stack traces from leaking to clients (security)
 *   ✓ Returns consistent error format for all exceptions
 *   ✓ Centralizes error logging
 *   ✓ Converts exceptions to appropriate HTTP status codes
 *   ✓ Improves API reliability and user experience
 *
 * How middleware works:
 *   1. Request → Middleware enters → Calls next middleware/endpoint
 *   2. Endpoint throws exception
 *   3. Middleware catches exception (try-catch)
 *   4. Formats error response with status code, message
 *   5. Logs error details
 *   6. Returns response to client (without sensitive details)
 */

public class GlobalErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;  // Next middleware in pipeline
    private readonly ILogger<GlobalErrorHandlingMiddleware> _logger;

    public GlobalErrorHandlingMiddleware(RequestDelegate next, ILogger<GlobalErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /*
     * IMPORTANT FLOW #2: MIDDLEWARE INVOCATION
     *
     * This method runs for EVERY request
     *
     * Order of execution:
     *   1. HttpContext arrives from previous middleware
     *   2. Try: Call next middleware (await _next(context))
     *   3. If exception: Catch it
     *   4. Handle exception: Format response, log, return error
     *   5. If no exception: Response passes through normally
     */
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            // IMPORTANT: Call next middleware in pipeline
            // This is where the request goes to the next middleware/endpoint
            // If an exception occurs in any downstream middleware/endpoint, it bubbles back here to catch block
            await _next(context);
        }
        catch (Exception exception)
        {
            // IMPORTANT: Exception caught here
            // This runs if ANY unhandled exception occurs downstream

            _logger.LogError(exception, "An unhandled exception has occurred: {ExceptionMessage}",
                exception.Message);

            // IMPORTANT: Format error response
            await HandleExceptionAsync(context, exception);
        }
    }

    /*
     * IMPORTANT FLOW #3: EXCEPTION HANDLING LOGIC
     *
     * Convert exception types to appropriate HTTP status codes:
     *   - ArgumentException → 400 Bad Request
     *   - KeyNotFoundException → 404 Not Found
     *   - UnauthorizedAccessException → 403 Forbidden
     *   - Generic Exception → 500 Internal Server Error
     *
     * Why different status codes?
     *   - 400: Client sent bad data (client's fault)
     *   - 404: Resource not found (client's fault)
     *   - 403: Access denied (security)
     *   - 500: Server error (server's fault)
     *
     * Never expose:
     *   - Stack traces to client
     *   - Database errors
     *   - Internal implementation details
     */
    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // Start: Set response content type and status code
        context.Response.ContentType = "application/json";

        // Map exception type to HTTP status code
        // IMPORTANT: This determines what error code client sees
        var response = exception switch
        {
            // Client errors (4xx)
            ArgumentException => new
            {
                status = HttpStatusCode.BadRequest,
                message = "Invalid argument provided.",
                detail = exception.Message
            },

            System.Collections.Generic.KeyNotFoundException => new
            {
                status = HttpStatusCode.NotFound,
                message = "Resource not found.",
                detail = exception.Message
            },

            UnauthorizedAccessException => new
            {
                status = HttpStatusCode.Forbidden,
                message = "Access denied.",
                detail = exception.Message
            },

            // Server error (5xx)
            _ => new
            {
                status = HttpStatusCode.InternalServerError,
                message = "An internal server error occurred.",
                detail = "Please try again later or contact support."
                // IMPORTANT: Don't expose exception.Message in production
                // Detail is generic - never leak implementation details
            }
        };

        // IMPORTANT: Set HTTP status code on response
        context.Response.StatusCode = (int)response.status;

        // IMPORTANT: Serialize error object to JSON
        var jsonResponse = JsonSerializer.Serialize(response);

        // IMPORTANT: Write response body and complete response
        return context.Response.WriteAsync(jsonResponse);
    }
}

/*
 * IMPORTANT FLOW #4: HOW TO REGISTER MIDDLEWARE
 *
 * In Program.cs, add this line EARLY in middleware pipeline:
 *
 *   app.UseMiddleware<GlobalErrorHandlingMiddleware>();
 *
 * IMPORTANT: Order matters!
 *   - Error handling should be FIRST (catches exceptions from all downstream middleware)
 *   - Routes/Controllers should be LAST (processes requests)
 *
 * Correct pipeline order:
 *   1. GlobalErrorHandlingMiddleware  (catches exceptions)
 *   2. RequestLoggingMiddleware       (logs requests)
 *   3. PerformanceMiddleware          (measures time)
 *   4. CORS middleware                (handles origins)
 *   5. app.MapControllers()           (API endpoints)
 */
