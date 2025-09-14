using MeetingRoom.Core.Entities;
using MeetingRoom.Core.Interfaces;
using MeetingRoom.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MeetingRoom.Infrastructure.Repositories
{
    public class AttendeeRepository : IAttendeeRepository
    {
        private readonly MeetingRoomContext _context;

        public AttendeeRepository(MeetingRoomContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Attendee>> GetAllAsync()
        {
            return await _context.Attendees
                .Include(a => a.User)
                .Include(a => a.Booking)
                .ToListAsync();
        }

        public async Task<Attendee?> GetByIdAsync(int id)
        {
            return await _context.Attendees
                .Include(a => a.User)
                .Include(a => a.Booking)
                .FirstOrDefaultAsync(a => a.AttendeeId == id);
        }

        public async Task AddAsync(Attendee entity)
        {
            _context.Attendees.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Attendee entity)
        {
            _context.Attendees.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.Attendees.FindAsync(id);
            if (entity != null)
            {
                _context.Attendees.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Attendee>> GetAttendeesByBookingIdAsync(Guid bookingId)
        {
            return await _context.Attendees
                .Include(a => a.User)
                .Where(a => a.BookingId == bookingId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Attendee>> GetAttendeesByUserIdAsync(int userId)
        {
            return await _context.Attendees
                .Include(a => a.Booking)
                .ThenInclude(b => b.Room)
                .Include(a => a.Booking)
                .ThenInclude(b => b.Organizer)
                .Where(a => a.UserId == userId)
                .ToListAsync();
        }
    }
}