using MeetingRoom.Core.Enums;

namespace MeetingRoom.Core.Entities
{
    public class BookingApproval
    {
        public int ApprovalId { get; set; }
        public Guid BookingId { get; set; }
        public int RequesterId { get; set; }
        public int? ApproverId { get; set; }
        public ApprovalStatus Status { get; set; }
        public string? Comments { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public int? SuggestedRoomId { get; set; }

        public virtual Booking Booking { get; set; } = null!;
        public virtual AppUser Requester { get; set; } = null!;
        public virtual AppUser? Approver { get; set; }
    }
}