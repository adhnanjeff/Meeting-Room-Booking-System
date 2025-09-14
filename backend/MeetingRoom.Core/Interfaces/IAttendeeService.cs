using MeetingRoom.Core.DTOs;

namespace MeetingRoom.Core.Interfaces
{
    public interface IAttendeeService
    {
        Task<AttendeeResponseDTO?> UpdateAttendeeStatusAsync(int attendeeId, AttendeeUpdateDTO updateDto);
        Task<List<AttendeeResponseDTO>> GetAttendeesByBookingIdAsync(Guid bookingId);
        Task<List<AttendeeResponseDTO>> GetAttendeesByUserIdAsync(int userId);
        Task<AttendeeResponseDTO?> GetAttendeeByIdAsync(int attendeeId);
    }
}