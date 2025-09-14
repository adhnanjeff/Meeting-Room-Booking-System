using System;
using System.Collections.Generic;

namespace MeetingRoom.Core.Entities;

public partial class MeetingRoomEntity
{
    public int RoomId { get; set; }

    public string RoomName { get; set; } = null!;

    public int Capacity { get; set; }

    public string Amenities { get; set; } = null!;

    public bool IsAvailable { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
