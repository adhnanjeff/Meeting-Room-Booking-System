using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Exceptions;
using System.Text.Json;

namespace MeetingRoom.API.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;
        private readonly IWebHostEnvironment _env;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IWebHostEnvironment env) {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch(Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        // Handling Custom exceptions
        private async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            var correlationId = context.TraceIdentifier;
            context.Response.ContentType = "application/json";

            int statusCode;
            string message;
            string? detail = null;

            switch (ex)
            {
                case NotFoundException nf:
                    statusCode = StatusCodes.Status404NotFound;
                    message = nf.Message;
                    detail = _env.IsDevelopment() ? nf.StackTrace : null;
                    break;

                case ValidationException val:
                    statusCode = StatusCodes.Status400BadRequest; 
                    message = val.Message;
                    detail = _env.IsDevelopment() ? val.StackTrace : null;
                    break;

                case UnauthorizedException unAuth:
                    statusCode = StatusCodes.Status401Unauthorized;
                    message = unAuth.Message;
                    detail = _env.IsDevelopment() ? unAuth.StackTrace : null;
                    break;

                case ForbiddenException forbidden:
                    statusCode = StatusCodes.Status403Forbidden;
                    message = forbidden.Message;
                    detail = _env.IsDevelopment() ? forbidden.StackTrace : null;
                    break;

                case ConflictException conflict:
                    statusCode = StatusCodes.Status409Conflict;
                    message = conflict.Message;
                    detail = _env.IsDevelopment() ? conflict.StackTrace : null;
                    break;

                default:
                    statusCode = StatusCodes.Status500InternalServerError;
                    message = "An unexpected error occurred.";
                    detail = _env.IsDevelopment() ? ex.StackTrace : null;
                    break;
            }

            var error = new ErrorResponseDTO
            {
                CorrelationId = correlationId,
                StatusCode = statusCode,
                Message = message,
                Details = detail
            };

            _logger.LogError(
                ex,
                "Unhandled exception for {Method} {Path}. CorrelationId: {CorrelationId}",
                context.Request.Method,
                context.Request.Path,
                correlationId
            );
            context.Response.StatusCode = statusCode;

            var jsonOptions = new JsonSerializerOptions { 
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            await context.Response.WriteAsync(JsonSerializer.Serialize(error, jsonOptions));
        }
    }
}
