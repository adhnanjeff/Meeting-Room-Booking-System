using System.ComponentModel.DataAnnotations;

namespace MeetingRoom.Core.Entities
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [StringLength(500)]
        public string Message { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string FromUser { get; set; } = string.Empty;
        
        [Required]
        public int UserId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsRead { get; set; } = false;
        
        // Navigation property
        public virtual AppUser User { get; set; } = null!;
    }
}