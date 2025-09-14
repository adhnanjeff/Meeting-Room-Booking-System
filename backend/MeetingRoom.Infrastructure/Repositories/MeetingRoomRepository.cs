using MeetingRoom.Core.Entities;
using MeetingRoom.Core.Interfaces;
using MeetingRoom.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MeetingRoom.Infrastructure.Repositories
{
    public class MeetingRoomRepository : IMeetingRoomRepository
    {
        private readonly MeetingRoomContext _context;

        public MeetingRoomRepository(MeetingRoomContext context)
        {
            _context = context;
        }

        public async Task AddAsync(MeetingRoomEntity entity)
        {
            _context.MeetingRooms.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.MeetingRooms.FindAsync(id);
            if (entity != null)
            {
                _context.MeetingRooms.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<MeetingRoomEntity>> GetAllAsync()
        {
            return await _context.MeetingRooms.ToListAsync();
        }

        public async Task<MeetingRoomEntity?> GetByIdAsync(int id)
        {
            return await _context.MeetingRooms.FindAsync(id);
        }

        public async Task UpdateAsync(MeetingRoomEntity entity)
        {
            _context.MeetingRooms.Update(entity);
            await _context.SaveChangesAsync();
        }
    }
}
