using MeetingRoom.Core.Enums;

namespace MeetingRoom.Core.DTOs
{
    public class ApprovalRequestDTO
    {
        public ApprovalStatus Status { get; set; }
        public string? Comments { get; set; }
        public int? SuggestedRoomId { get; set; }
    }
}