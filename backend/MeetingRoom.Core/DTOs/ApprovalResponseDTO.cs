using MeetingRoom.Core.Enums;

namespace MeetingRoom.Core.DTOs
{
    public class ApprovalResponseDTO
    {
        public int ApprovalId { get; set; }
        public Guid BookingId { get; set; }
        public string BookingTitle { get; set; } = string.Empty;
        public string RequesterName { get; set; } = string.Empty;
        public string? ApproverName { get; set; }
        public ApprovalStatus Status { get; set; }
        public string? Comments { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime MeetingStartTime { get; set; }
        public DateTime MeetingEndTime { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public int? SuggestedRoomId { get; set; }
        public string? SuggestedRoomName { get; set; }
    }
}