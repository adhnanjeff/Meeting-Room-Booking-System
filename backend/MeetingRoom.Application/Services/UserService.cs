using AutoMapper;
using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Entities;
using MeetingRoom.Core.Enums;
using MeetingRoom.Core.Interfaces;

namespace MeetingRoom.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public UserService(IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<bool> RespondToInvitationAsync(int attendeeId, AttendeeStatus status)
        {
            return await _userRepository.UpdateAttendeeStatusAsync(attendeeId, status);
        }


        public async Task<UserResponseDTO> CreateUserAsync(UserRequestDTO userDto)
        {
            if (userDto == null) throw new ArgumentNullException(nameof(userDto));
            
            var user = _mapper.Map<AppUser>(userDto);
            await _userRepository.AddAsync(user);
            return _mapper.Map<UserResponseDTO>(user);
        }

        public async Task UpdateUserAsync(int id, UserRequestDTO userDto)
        {
            if (userDto == null) throw new ArgumentNullException(nameof(userDto));
            
            var existingUser = await _userRepository.GetByIdAsync(id);
            if (existingUser == null)
                throw new KeyNotFoundException($"User with id {id} not found");

            _mapper.Map(userDto, existingUser);
            await _userRepository.UpdateAsync(existingUser);
        }

        public async Task DeleteUserAsync(int id)
        {
            await _userRepository.DeleteAsync(id);
        }

        public async Task<List<UserResponseDTO>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return _mapper.Map<List<UserResponseDTO>>(users);
        }

        public async Task<UserResponseDTO?> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            return user == null ? null : _mapper.Map<UserResponseDTO>(user);
        }

        public async Task<UserProfileDTO?> GetUserProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return null;

            return new UserProfileDTO
            {
                Id = user.Id,
                UserName = user.UserName ?? "",
                Email = user.Email ?? "",
                Department = user.Department,
                Role = user.Role,
                ManagerName = user.Manager?.UserName,
                Subordinates = user.Subordinates.Select(s => s.UserName ?? "").ToList()
            };
        }

        public async Task<UserProfileDTO> UpdateUserProfileAsync(int userId, UpdateUserProfileDTO updateDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new KeyNotFoundException($"User with id {userId} not found");

            if (!string.IsNullOrEmpty(updateDto.Department))
                user.Department = updateDto.Department;
            
            
            if (updateDto.ManagerId.HasValue)
                user.ManagerId = updateDto.ManagerId;
            
            if (updateDto.Role.HasValue)
                user.Role = updateDto.Role.Value;

            await _userRepository.UpdateAsync(user);
            return await GetUserProfileAsync(userId) ?? throw new Exception("Failed to retrieve updated profile");
        }

        public async Task<UserProfileDTO> UpdateEmployeeAsync(int userId, UpdateEmployeeDTO updateDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new KeyNotFoundException($"User with id {userId} not found");

            if (!string.IsNullOrEmpty(updateDto.Department))
                user.Department = updateDto.Department;
            
            
            // Allow setting manager to null
            user.ManagerId = updateDto.ManagerId;
            
            if (updateDto.Role.HasValue)
                user.Role = updateDto.Role.Value;

            await _userRepository.UpdateAsync(user);
            return await GetUserProfileAsync(userId) ?? throw new Exception("Failed to retrieve updated profile");
        }

        public async Task<UserProfileDTO?> GetUserProfileByUsernameAsync(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null) return null;

            return new UserProfileDTO
            {
                Id = user.Id,
                UserName = user.UserName ?? "",
                Email = user.Email ?? "",
                Department = user.Department,
                Role = user.Role,
                ManagerName = user.Manager?.UserName,
                Subordinates = user.Subordinates.Select(s => s.UserName ?? "").ToList()
            };
        }

        public async Task UpdateUserRoleAsync(int userId, int roleValue)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new KeyNotFoundException($"User with id {userId} not found");

            user.Role = (UserRole)roleValue;
            await _userRepository.UpdateAsync(user);
        }

        public async Task<List<UserResponseDTO>> GetTeamMembersAsync(int managerId)
        {
            var teamMembers = await _userRepository.GetTeamMembersAsync(managerId);
            return _mapper.Map<List<UserResponseDTO>>(teamMembers);
        }
    }
}
