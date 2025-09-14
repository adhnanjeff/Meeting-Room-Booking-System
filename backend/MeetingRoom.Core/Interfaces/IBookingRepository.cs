using MeetingRoom.Core.Entities;

namespace MeetingRoom.Core.Interfaces
{
    public interface IBookingRepository : IRepository<Booking, Guid>
    {
        Task<IEnumerable<Booking>> GetBookingsByRoomIdAsync(int roomId);
        Task<IEnumerable<Booking>> GetBookingsByUserIdAsync(int userId);
        Task<bool> IsRoomAvailableAsync(int roomId, DateTime startTime, DateTime endTime, Guid? excludeBookingId = null);
        Task<IEnumerable<Booking>> GetConflictingBookingsAsync(int roomId, DateTime startTime, DateTime endTime);
        Task<IEnumerable<Booking>> GetUserConflictingBookingsAsync(int userId, DateTime startTime, DateTime endTime, Guid? excludeBookingId = null);
        Task<IEnumerable<Booking>> GetActiveBookingsAsync();
    }
}