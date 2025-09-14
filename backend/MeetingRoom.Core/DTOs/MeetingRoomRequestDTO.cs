using System.ComponentModel.DataAnnotations;
using MeetingRoom.Core.Entities;

namespace MeetingRoom.Core.DTOs
{
    public class MeetingRoomRequestDTO
    {
        [Required]
        [StringLength(100)]
        public string RoomName { get; set; } = string.Empty;
        
        [Range(1, 1000)]
        public int Capacity { get; set; }
        
        public string Amenities { get; set; } = string.Empty;
        public string PriorityLevel { get; set; } = string.Empty;
    }
}
