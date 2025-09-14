using MeetingRoom.Core.Enums;

namespace MeetingRoom.Core.DTOs
{
    public class AttendeeUpdateDTO
    {
        public AttendeeStatus Status { get; set; }
        public string? RoleInMeeting { get; set; }
    }
}