using MeetingRoom.Core.Entities;
using MeetingRoom.Core.Enums;

namespace MeetingRoom.Core.Interfaces
{
    public interface IUserRepository : IRepository<AppUser, int>
    {
        Task<bool> UpdateAttendeeStatusAsync(int attendeeId, AttendeeStatus status);
        Task<AppUser?> GetByUsernameAsync(string username);
        Task<List<AppUser>> GetTeamMembersAsync(int managerId);
    }
}
