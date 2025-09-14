using MeetingRoom.Core.Entities;
using MeetingRoom.Core.Enums;
using MeetingRoom.Core.Interfaces;
using MeetingRoom.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MeetingRoom.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly MeetingRoomContext _context;

        public UserRepository(MeetingRoomContext context)
        {
            _context = context;
        }

        


        public async Task<IEnumerable<AppUser>> GetAllAsync()
        {
            return await _context.Users.ToListAsync(); // Identity's DbSet<AppUser>
        }

        public async Task<AppUser?> GetByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.Manager)
                .Include(u => u.Subordinates)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task AddAsync(AppUser entity)
        {
            // You should normally use UserManager for Identity users,
            // but if you want to use EF Core directly:
            entity.EmailConfirmed = true;
            entity.NormalizedUserName = entity.UserName?.ToUpper();
            entity.NormalizedEmail = entity.Email?.ToUpper();

            _context.Users.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(AppUser entity)
        {
            var existing = await _context.Users.FindAsync(entity.Id);
            if (existing != null)
            {
                existing.UserName = entity.UserName;
                existing.Email = entity.Email;
                existing.Department = entity.Department;
                existing.Role = entity.Role; // Make sure Role is updated
                existing.ManagerId = entity.ManagerId; // Make sure ManagerId is updated
                existing.NormalizedUserName = entity.UserName?.ToUpper();
                existing.NormalizedEmail = entity.Email?.ToUpper();

                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.Users.FindAsync(id);
            if (entity != null)
            {
                _context.Users.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> UpdateAttendeeStatusAsync(int attendeeId, AttendeeStatus status)
        {
            var attendee = await _context.Attendees.FindAsync(attendeeId);
            if (attendee == null) return false;

            attendee.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<AppUser?> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .Include(u => u.Manager)
                .Include(u => u.Subordinates)
                .FirstOrDefaultAsync(u => u.UserName == username);
        }

        public async Task<List<AppUser>> GetTeamMembersAsync(int managerId)
        {
            return await _context.Users
                .Where(u => u.ManagerId == managerId)
                .ToListAsync();
        }
    }
}
