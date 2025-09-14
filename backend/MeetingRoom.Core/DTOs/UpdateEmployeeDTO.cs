using MeetingRoom.Core.Enums;

namespace MeetingRoom.Core.DTOs
{
    public class UpdateEmployeeDTO
    {
        public string? Department { get; set; }
        public int? ManagerId { get; set; }
        public UserRole? Role { get; set; }
        public string? Preferences { get; set; }
    }
}