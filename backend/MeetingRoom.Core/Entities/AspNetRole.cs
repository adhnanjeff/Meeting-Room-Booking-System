using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace MeetingRoom.Core.Entities;

public partial class AspNetRole : IdentityRole<int>
{
    public virtual ICollection<AppUser> Users { get; set; } = new List<AppUser>();
}
