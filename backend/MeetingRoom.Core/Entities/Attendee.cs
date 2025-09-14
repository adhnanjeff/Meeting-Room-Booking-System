using System;
using System.Collections.Generic;
using MeetingRoom.Core.Enums;

namespace MeetingRoom.Core.Entities;

public partial class Attendee
{
    public int AttendeeId { get; set; }

    public Guid BookingId { get; set; }

    public int UserId { get; set; }

    public AttendeeStatus Status { get; set; }

    public string RoleInMeeting { get; set; } = null!;

    public virtual Booking Booking { get; set; } = null!;

    public virtual AppUser User { get; set; } = null!;
}
