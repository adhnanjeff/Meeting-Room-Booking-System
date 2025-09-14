using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Enums;

namespace MeetingRoom.Core.Interfaces
{
    public interface IUserService
    {
        Task<UserResponseDTO> CreateUserAsync(UserRequestDTO userDto);
        Task UpdateUserAsync(int id, UserRequestDTO userDto);
        Task DeleteUserAsync(int id);
        Task<List<UserResponseDTO>> GetAllUsersAsync();
        Task<UserResponseDTO?> GetUserByIdAsync(int id);
        Task<bool> RespondToInvitationAsync(int attendeeId, AttendeeStatus status);
        Task<UserProfileDTO?> GetUserProfileAsync(int userId);
        Task<UserProfileDTO?> GetUserProfileByUsernameAsync(string username);
        Task<UserProfileDTO> UpdateUserProfileAsync(int userId, UpdateUserProfileDTO updateDto);
        Task<UserProfileDTO> UpdateEmployeeAsync(int userId, UpdateEmployeeDTO updateDto);
        Task UpdateUserRoleAsync(int userId, int roleValue);
        Task<List<UserResponseDTO>> GetTeamMembersAsync(int managerId);
    }
}
