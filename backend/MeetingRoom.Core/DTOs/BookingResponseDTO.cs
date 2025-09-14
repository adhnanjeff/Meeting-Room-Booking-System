namespace MeetingRoom.Core.DTOs
{
    public class BookingResponseDTO
    {
        public Guid BookingId { get; set; }
        public int RoomId { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public int OrganizerId { get; set; }
        public string OrganizerName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ApprovalStatus { get; set; }
        public bool IsEmergency { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<AttendeeResponseDTO> Attendees { get; set; } = new();
    }
}