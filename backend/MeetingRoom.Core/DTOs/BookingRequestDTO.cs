using System.ComponentModel.DataAnnotations;

namespace MeetingRoom.Core.DTOs
{
    public class BookingRequestDTO
    {
        [Required]
        public int RoomId { get; set; }
        
        [Required]
        public int OrganizerId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public DateTime StartTime { get; set; }
        
        [Required]
        public DateTime EndTime { get; set; }
        
        public bool IsEmergency { get; set; } = false;
        
        public List<int> AttendeeUserIds { get; set; } = new();
        
        public string? RefreshmentRequests { get; set; }
    }
}