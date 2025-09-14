using MeetingRoom.Core.DTOs;

namespace MeetingRoom.Core.Interfaces
{
    public interface IBookingService
    {
        Task<BookingResponseDTO> CreateBookingAsync(BookingRequestDTO bookingDto);
        Task<BookingResponseDTO> UpdateBookingAsync(Guid id, BookingRequestDTO bookingDto);
        Task DeleteBookingAsync(Guid id);
        Task<List<BookingResponseDTO>> GetAllBookingsAsync();
        Task<BookingResponseDTO?> GetBookingByIdAsync(Guid id);
        Task<List<BookingResponseDTO>> GetBookingsByRoomIdAsync(int roomId);
        Task<List<BookingResponseDTO>> GetBookingsByUserIdAsync(int userId);
        Task<bool> CheckRoomAvailabilityAsync(int roomId, DateTime startTime, DateTime endTime);
        Task<ConflictDetailsDTO> CheckBookingConflictsAsync(BookingRequestDTO bookingDto);
        Task CreateApprovalRequestAsync(Guid bookingId, int requesterId);
        Task<BookingResponseDTO> EndMeetingEarlyAsync(Guid bookingId, int organizerId);
        Task<BookingResponseDTO> ExtendMeetingAsync(Guid bookingId, int organizerId, DateTime newEndTime);
    }
}