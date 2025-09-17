

using MeetingRoom.Core.DTOs;

namespace MeetingRoom.Core.Interfaces
{
    public interface IMeetingRoomService
    {
        Task<MeetingRoomResponseDTO> CreateRoomAsync(MeetingRoomRequestDTO roomDto);
        Task UpdateRoomAsync(int id, MeetingRoomRequestDTO roomDto);
        Task DeleteRoomAsync(int id);
        Task<List<MeetingRoomResponseDTO>> GetAllRoomsAsync();
        Task<List<MeetingRoomResponseDTO>> GetAvailableRoomsAsync(DateTime startTime, DateTime endTime);
        Task<MeetingRoomResponseDTO?> GetRoomByIdAsync(int id);
    }
}
