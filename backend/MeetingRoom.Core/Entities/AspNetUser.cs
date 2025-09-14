using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using MeetingRoom.Core.Enums;

namespace MeetingRoom.Core.Entities;

public partial class AppUser : IdentityUser<int>
{
    public string Department { get; set; } = null!;
    public UserRole Role { get; set; }
    public int? ManagerId { get; set; }


    public virtual AppUser? Manager { get; set; }
    public virtual ICollection<AppUser> Subordinates { get; set; } = new List<AppUser>();
    public virtual ICollection<Attendee> Attendees { get; set; } = new List<Attendee>();
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public virtual ICollection<BookingApproval> RequestedApprovals { get; set; } = new List<BookingApproval>();
    public virtual ICollection<BookingApproval> ProcessedApprovals { get; set; } = new List<BookingApproval>();

}
