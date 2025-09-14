using MeetingRoom.Core.Enums;

namespace MeetingRoom.Core.DTOs
{
    public class UserResponseDTO
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public UserRole UserRole { get; set; }
        public List<string> Roles { get; set; } = new();
    }
}
