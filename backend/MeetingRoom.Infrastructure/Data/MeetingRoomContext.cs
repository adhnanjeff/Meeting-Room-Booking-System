using MeetingRoom.Core.Entities;
using MeetingRoom.Core.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MeetingRoom.Infrastructure.Data;

public partial class MeetingRoomContext : IdentityDbContext<AppUser, IdentityRole<int>, int>
{
    public MeetingRoomContext(DbContextOptions<MeetingRoomContext> options)
        : base(options)
    {
    }

    // Your domain entities
    public virtual DbSet<Attendee> Attendees { get; set; }
    public virtual DbSet<Booking> Bookings { get; set; }
    public virtual DbSet<MeetingRoomEntity> MeetingRooms { get; set; }
    public virtual DbSet<BookingApproval> BookingApprovals { get; set; }
    public virtual DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure table names to be plural
        modelBuilder.Entity<Booking>().ToTable("Bookings");
        modelBuilder.Entity<Attendee>().ToTable("Attendees");
        modelBuilder.Entity<MeetingRoomEntity>().ToTable("MeetingRooms");
        modelBuilder.Entity<Notification>().ToTable("Notifications");

        // Configure Booking entity
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.BookingId);
            entity.Property(e => e.BookingId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getutcdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.EndTime).HasColumnType("datetime");
            entity.Property(e => e.StartTime).HasColumnType("datetime");
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Organizer)
                .WithMany(p => p.Bookings)
                .HasForeignKey(d => d.OrganizerId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Bookings_Organizer");

            entity.HasOne(d => d.Room)
                .WithMany(p => p.Bookings)
                .HasForeignKey(d => d.RoomId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Bookings_Room");
        });

        // Configure Attendee entity
        modelBuilder.Entity<Attendee>(entity =>
        {
            entity.HasKey(e => e.AttendeeId);
            entity.Property(e => e.RoleInMeeting).HasMaxLength(50);

            entity.HasOne(d => d.User)
                .WithMany(p => p.Attendees)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Attendees_User");

            entity.HasOne(d => d.Booking)
                .WithMany(p => p.Attendees)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Attendees_Booking");
        });

        // Configure MeetingRoom entity
        modelBuilder.Entity<MeetingRoomEntity>(entity =>
        {
            entity.HasKey(e => e.RoomId);
            entity.Property(e => e.IsAvailable).HasDefaultValue(true);
            entity.Property(e => e.RoomName).HasMaxLength(100);
            entity.Property(e => e.Amenities).HasMaxLength(500);
        });

        // Configure AppUser additional properties
        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.Property(e => e.Department).HasMaxLength(100);
            entity.Property(e => e.Role).HasDefaultValue(UserRole.Employee);
            
            entity.HasOne(e => e.Manager)
                .WithMany(e => e.Subordinates)
                .HasForeignKey(e => e.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure BookingApproval entity
        modelBuilder.Entity<BookingApproval>(entity =>
        {
            entity.ToTable("BookingApprovals");
            entity.HasKey(e => e.ApprovalId);
            entity.Property(e => e.Comments).HasMaxLength(500);
            entity.Property(e => e.RequestedAt).HasDefaultValueSql("(getutcdate())");

            entity.HasOne(e => e.Booking)
                .WithMany()
                .HasForeignKey(e => e.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Requester)
                .WithMany(e => e.RequestedApprovals)
                .HasForeignKey(e => e.RequesterId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Approver)
                .WithMany(e => e.ProcessedApprovals)
                .HasForeignKey(e => e.ApproverId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Notification entity
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Message).HasMaxLength(500);
            entity.Property(e => e.FromUser).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.IsRead).HasDefaultValue(false);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed admin user
        var hasher = new PasswordHasher<AppUser>();
        modelBuilder.Entity<AppUser>().HasData(new AppUser
        {
            Id = 1,
            UserName = "admin",
            NormalizedUserName = "ADMIN",
            Email = "admin@example.com",
            NormalizedEmail = "ADMIN@EXAMPLE.COM",
            EmailConfirmed = true,
            PasswordHash = hasher.HashPassword(null, "Aa@123"),
            SecurityStamp = Guid.NewGuid().ToString(),
            Department = "Admin",
            Role = UserRole.Admin,
            ManagerId = null
        });
    }
}
