namespace MeetingRoom.Core.DTOs
{
    public class ConflictDetailsDTO
    {
        public List<RoomConflictDTO> RoomConflicts { get; set; } = new();
        public List<AttendeeConflictDTO> AttendeeConflicts { get; set; } = new();
    }

    public class RoomConflictDTO
    {
        public Guid BookingId { get; set; }
        public string BookingTitle { get; set; } = "";
        public string OrganizerName { get; set; } = "";
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsEmergency { get; set; }
    }

    public class AttendeeConflictDTO
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = "";
        public Guid ConflictingBookingId { get; set; }
        public string ConflictingBookingTitle { get; set; } = "";
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}