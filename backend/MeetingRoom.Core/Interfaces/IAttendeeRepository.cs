using MeetingRoom.Core.Entities;

namespace MeetingRoom.Core.Interfaces
{
    public interface IAttendeeRepository : IRepository<Attendee, int>
    {
        Task<IEnumerable<Attendee>> GetAttendeesByBookingIdAsync(Guid bookingId);
        Task<IEnumerable<Attendee>> GetAttendeesByUserIdAsync(int userId);
    }
}