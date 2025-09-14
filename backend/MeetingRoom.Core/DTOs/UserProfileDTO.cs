using MeetingRoom.Core.Enums;

namespace MeetingRoom.Core.DTOs
{
    public class UserProfileDTO
    {
        public int Id { get; set; }
        public string UserName { get; set; } = "";
        public string Email { get; set; } = "";
        public string Department { get; set; } = "";
        public UserRole Role { get; set; }
        public string? ManagerName { get; set; }
        public string? Preferences { get; set; }
        public List<string> Subordinates { get; set; } = new();
    }

    public class UpdateUserProfileDTO
    {
        public string? Department { get; set; }
        public string? Preferences { get; set; }
        public int? ManagerId { get; set; }
        public UserRole? Role { get; set; }
    }
}