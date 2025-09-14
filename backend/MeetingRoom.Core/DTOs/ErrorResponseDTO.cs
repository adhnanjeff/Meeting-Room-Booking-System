using System.ComponentModel.DataAnnotations;

namespace MeetingRoom.Core.DTOs
{
    public class ErrorResponseDTO
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public string CorrelationId { get; set; } = string.Empty;
    }
}
