using MeetingRoom.Core.Enums;

namespace MeetingRoom.Core.DTOs
{
    public class AttendeeRequestDTO
    {
        public int AttendeeId { get; set; }
        public AttendeeStatus Status { get; set; }
    }
}
