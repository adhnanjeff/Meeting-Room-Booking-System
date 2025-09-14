using MeetingRoom.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace MeetingRoom.Core.DTOs
{
    public class UserRequestDTO
    {
        [Required]
        [StringLength(50)]
        public string UserName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        public string Department { get; set; } = string.Empty;

        public UserRole UserRole { get; set; }
        
        public int? ManagerId { get; set; }
    }
}
