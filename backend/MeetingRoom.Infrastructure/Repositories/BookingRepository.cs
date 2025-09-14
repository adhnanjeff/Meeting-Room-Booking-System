using MeetingRoom.Core.Entities;
using MeetingRoom.Core.Enums;
using MeetingRoom.Core.Interfaces;
using MeetingRoom.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MeetingRoom.Infrastructure.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly MeetingRoomContext _context;

        public BookingRepository(MeetingRoomContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Booking>> GetAllAsync()
        {
            return await _context.Bookings
                .Include(b => b.Room)
                .Include(b => b.Organizer)
                .Include(b => b.Attendees)
                .ThenInclude(a => a.User)
                .ToListAsync();
        }

        public async Task<Booking?> GetByIdAsync(Guid id)
        {
            return await _context.Bookings
                .Include(b => b.Room)
                .Include(b => b.Organizer)
                .Include(b => b.Attendees)
                .ThenInclude(a => a.User)
                .FirstOrDefaultAsync(b => b.BookingId == id);
        }

        public async Task AddAsync(Booking entity)
        {
            _context.Bookings.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Booking entity)
        {
            _context.Bookings.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await _context.Bookings.FindAsync(id);
            if (entity != null)
            {
                _context.Bookings.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Booking>> GetBookingsByRoomIdAsync(int roomId)
        {
            return await _context.Bookings
                .Include(b => b.Organizer)
                .Include(b => b.Attendees)
                .ThenInclude(a => a.User)
                .Where(b => b.RoomId == roomId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetBookingsByUserIdAsync(int userId)
        {
            return await _context.Bookings
                .Include(b => b.Room)
                .Include(b => b.Attendees)
                .ThenInclude(a => a.User)
                .Where(b => b.OrganizerId == userId || b.Attendees.Any(a => a.UserId == userId))
                .ToListAsync();
        }

        public async Task<bool> IsRoomAvailableAsync(int roomId, DateTime startTime, DateTime endTime, Guid? excludeBookingId = null)
        {
            var conflictingBookings = await GetConflictingBookingsAsync(roomId, startTime, endTime);
            
            if (excludeBookingId.HasValue)
            {
                conflictingBookings = conflictingBookings.Where(b => b.BookingId != excludeBookingId.Value);
            }
            
            return !conflictingBookings.Any();
        }

        public async Task<IEnumerable<Booking>> GetConflictingBookingsAsync(int roomId, DateTime startTime, DateTime endTime)
        {
            return await _context.Bookings
                .Include(b => b.Organizer)
                .Where(b => b.RoomId == roomId &&
                           b.Status != BookingStatus.Cancelled &&
                           ((b.StartTime < endTime && b.EndTime > startTime)))
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetUserConflictingBookingsAsync(int userId, DateTime startTime, DateTime endTime, Guid? excludeBookingId = null)
        {
            var query = _context.Bookings
                .Include(b => b.Room)
                .Include(b => b.Attendees)
                .Where(b => b.Status != BookingStatus.Cancelled &&
                           (b.OrganizerId == userId || b.Attendees.Any(a => a.UserId == userId && a.Status == AttendeeStatus.Accepted)) &&
                           ((b.StartTime < endTime && b.EndTime > startTime)));

            if (excludeBookingId.HasValue)
                query = query.Where(b => b.BookingId != excludeBookingId.Value);

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetActiveBookingsAsync()
        {
            return await _context.Bookings
                .Where(b => b.Status == BookingStatus.Scheduled)
                .ToListAsync();
        }
    }
}