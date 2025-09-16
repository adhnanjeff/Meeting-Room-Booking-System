using System;
using System.Collections.Generic;
using MeetingRoom.Core.Enums;

namespace MeetingRoom.Core.Entities;

public partial class Booking
{
    public Guid BookingId { get; set; }

    public int RoomId { get; set; }

    public int OrganizerId { get; set; }

    public string Title { get; set; } = null!;

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public BookingStatus Status { get; set; }
    public bool RequiresApproval { get; set; }
    public bool IsEmergency { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
    public DateTime? ActualEndTime { get; set; }
    public string? RefreshmentRequests { get; set; }
    public string? TeamsEventId { get; set; }
    public string? TeamsJoinUrl { get; set; }

    public virtual ICollection<Attendee> Attendees { get; set; } = new List<Attendee>();

    public virtual AppUser Organizer { get; set; } = null!;
    public virtual MeetingRoomEntity Room { get; set; } = null!;
}
