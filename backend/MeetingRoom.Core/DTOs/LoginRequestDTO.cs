using System.ComponentModel.DataAnnotations;

namespace MeetingRoom.Core.DTOs
{
    public class LoginRequestDTO
    {
        [Required]
        public string UserName { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
