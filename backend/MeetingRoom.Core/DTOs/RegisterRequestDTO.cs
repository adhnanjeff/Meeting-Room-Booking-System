using System.ComponentModel.DataAnnotations;

namespace MeetingRoom.Core.DTOs
{
    public class RegisterRequestDTO
    {
        [Required]
        [StringLength(50)]
        public string UserName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Department { get; set; } = string.Empty;
        
        [Required]
        public string Role { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;
        
        public int? ManagerId { get; set; }
    }
}
