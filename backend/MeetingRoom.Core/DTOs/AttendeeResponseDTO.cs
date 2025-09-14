using MeetingRoom.Core.Enums;

namespace MeetingRoom.Core.DTOs
{
    public class AttendeeResponseDTO
    {
        public int AttendeeId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = "";
        public Guid BookingId { get; set; }
        public string BookingTitle { get; set; } = "";
        public AttendeeStatus Status { get; set; }
        public string RoleInMeeting { get; set; } = "";
    }
}