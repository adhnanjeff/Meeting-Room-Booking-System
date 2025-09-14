using MeetingRoom.Core.DTOs;

namespace MeetingRoom.Core.Interfaces
{
    public interface IApprovalService
    {
        Task<List<ApprovalResponseDTO>> GetPendingApprovalsAsync(int managerId);
        Task<List<ApprovalResponseDTO>> GetAllApprovalsAsync(int managerId);
        Task<ApprovalResponseDTO> ProcessApprovalAsync(int approvalId, ApprovalRequestDTO request, int approverId);
        Task<ApprovalResponseDTO> CreateApprovalRequestAsync(Guid bookingId, int requesterId);
        Task<ApprovalResponseDTO> CreateApprovalRequestAsync(BookingRequestDTO bookingRequest);
        Task<ApprovalResponseDTO> SuggestAlternativeRoomAsync(int approvalId, RoomSuggestionDTO suggestion, int approverId);
    }
}