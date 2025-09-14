using AutoMapper;
using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Entities;
using MeetingRoom.Core.Enums;
using MeetingRoom.Core.Exceptions;
using MeetingRoom.Core.Interfaces;
using MeetingRoom.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MeetingRoom.Application.Services
{
    public class ApprovalService : IApprovalService
    {
        private readonly MeetingRoomContext _context;
        private readonly IMapper _mapper;

        public ApprovalService(MeetingRoomContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<ApprovalResponseDTO>> GetPendingApprovalsAsync(int managerId)
        {
            var approvals = await _context.BookingApprovals
                .Include(a => a.Booking)
                .ThenInclude(b => b.Room)
                .Include(a => a.Requester)
                .Where(a => a.Status == ApprovalStatus.Pending && a.Requester.ManagerId == managerId)
                .ToListAsync();

            Console.WriteLine($"Found {approvals.Count} pending approvals for manager {managerId}");

            return approvals.Select(a => new ApprovalResponseDTO
            {
                ApprovalId = a.ApprovalId,
                BookingId = a.BookingId,
                BookingTitle = a.Booking.Title,
                RequesterName = a.Requester.UserName ?? "",
                ApproverName = "",
                Status = a.Status,
                Comments = a.Comments,
                RequestedAt = a.RequestedAt,
                MeetingStartTime = a.Booking.StartTime,
                MeetingEndTime = a.Booking.EndTime,
                RoomName = a.Booking.Room?.RoomName ?? ""
            }).ToList();
        }

        public async Task<List<ApprovalResponseDTO>> GetAllApprovalsAsync(int managerId)
        {
            var approvals = await _context.BookingApprovals
                .Include(a => a.Booking)
                .ThenInclude(b => b.Room)
                .Include(a => a.Requester)
                .Where(a => a.Requester.ManagerId == managerId)
                .ToListAsync();

            Console.WriteLine($"Found {approvals.Count} total approvals for manager {managerId}");

            return approvals.Select(a => new ApprovalResponseDTO
            {
                ApprovalId = a.ApprovalId,
                BookingId = a.BookingId,
                BookingTitle = a.Booking?.Title ?? "No Title",
                RequesterName = a.Requester?.UserName ?? "Unknown",
                ApproverName = "",
                Status = a.Status,
                Comments = a.Comments,
                RequestedAt = a.RequestedAt,
                ApprovedAt = a.ApprovedAt,
                MeetingStartTime = a.Booking?.StartTime ?? DateTime.MinValue,
                MeetingEndTime = a.Booking?.EndTime ?? DateTime.MinValue,
                RoomName = a.Booking?.Room?.RoomName ?? "Unknown Room"
            }).ToList();
        }

        public async Task<ApprovalResponseDTO> ProcessApprovalAsync(int approvalId, ApprovalRequestDTO request, int approverId)
        {
            var approval = await _context.BookingApprovals
                .Include(a => a.Booking)
                .ThenInclude(b => b.Room)
                .Include(a => a.Requester)
                .FirstOrDefaultAsync(a => a.ApprovalId == approvalId);

            if (approval == null)
                throw new NotFoundException("Approval request not found");

            if (approval.Status != ApprovalStatus.Pending)
                throw new ValidationException("Approval request has already been processed");

            approval.Status = request.Status;
            approval.Comments = request.Comments;
            
            // Only set ApproverId if the user exists
            var approver = await _context.Users.FindAsync(approverId);
            if (approver != null)
            {
                approval.ApproverId = approverId;
            }
            
            approval.ApprovedAt = DateTime.UtcNow;

            // Update booking status based on approval decision
            if (request.Status == ApprovalStatus.Approved)
            {
                approval.Booking.Status = BookingStatus.Scheduled;
            }
            else if (request.Status == ApprovalStatus.Rejected)
            {
                approval.Booking.Status = BookingStatus.Cancelled;
            }

            await _context.SaveChangesAsync();

            return new ApprovalResponseDTO
            {
                ApprovalId = approval.ApprovalId,
                BookingId = approval.BookingId,
                BookingTitle = approval.Booking.Title,
                RequesterName = approval.Requester.UserName ?? "",
                ApproverName = "",
                Status = approval.Status,
                Comments = approval.Comments,
                RequestedAt = approval.RequestedAt,
                ApprovedAt = approval.ApprovedAt,
                MeetingStartTime = approval.Booking.StartTime,
                MeetingEndTime = approval.Booking.EndTime,
                RoomName = approval.Booking.Room?.RoomName ?? "",
                SuggestedRoomId = approval.SuggestedRoomId
            };
        }

        public async Task<ApprovalResponseDTO> CreateApprovalRequestAsync(Guid bookingId, int requesterId)
        {
            var approval = new BookingApproval
            {
                BookingId = bookingId,
                RequesterId = requesterId,
                Status = ApprovalStatus.Pending,
                RequestedAt = DateTime.UtcNow
            };

            _context.BookingApprovals.Add(approval);
            await _context.SaveChangesAsync();

            return await GetApprovalByIdAsync(approval.ApprovalId);
        }

        public async Task<ApprovalResponseDTO> CreateApprovalRequestAsync(BookingRequestDTO bookingRequest)
        {
            // First create the booking
            var booking = new Booking
            {
                BookingId = Guid.NewGuid(),
                RoomId = bookingRequest.RoomId,
                OrganizerId = bookingRequest.OrganizerId,
                Title = bookingRequest.Title,
                StartTime = bookingRequest.StartTime,
                EndTime = bookingRequest.EndTime,
                Status = BookingStatus.Pending,
                IsEmergency = bookingRequest.IsEmergency,
                CreatedAt = DateTime.UtcNow,
                Attendees = new List<Attendee>()
            };

            // Add attendees
            foreach (var userId in bookingRequest.AttendeeUserIds)
            {
                var attendee = new Attendee
                {
                    BookingId = booking.BookingId,
                    UserId = userId,
                    Status = AttendeeStatus.Pending,
                    RoleInMeeting = "Participant"
                };
                booking.Attendees.Add(attendee);
            }

            _context.Bookings.Add(booking);

            // Create approval request
            var approval = new BookingApproval
            {
                BookingId = booking.BookingId,
                RequesterId = bookingRequest.OrganizerId,
                Status = ApprovalStatus.Pending,
                RequestedAt = DateTime.UtcNow
            };

            _context.BookingApprovals.Add(approval);
            await _context.SaveChangesAsync();

            return await GetApprovalByIdAsync(approval.ApprovalId);
        }

        public async Task<ApprovalResponseDTO> SuggestAlternativeRoomAsync(int approvalId, RoomSuggestionDTO suggestion, int approverId)
        {
            var approval = await _context.BookingApprovals
                .Include(a => a.Booking)
                .FirstOrDefaultAsync(a => a.ApprovalId == approvalId);

            if (approval == null)
                throw new NotFoundException("Approval request not found");

            approval.SuggestedRoomId = suggestion.SuggestedRoomId;
            approval.Comments = suggestion.Comments;
            
            // Only set ApproverId if the user exists
            var approver = await _context.Users.FindAsync(approverId);
            if (approver != null)
            {
                approval.ApproverId = approverId;
            }

            await _context.SaveChangesAsync();
            return await GetApprovalByIdAsync(approval.ApprovalId);
        }

        private async Task<ApprovalResponseDTO> GetApprovalByIdAsync(int approvalId)
        {
            var approval = await _context.BookingApprovals
                .Include(a => a.Booking)
                .ThenInclude(b => b.Room)
                .Include(a => a.Requester)
                .Include(a => a.Approver)
                .FirstOrDefaultAsync(a => a.ApprovalId == approvalId);

            return _mapper.Map<ApprovalResponseDTO>(approval!);
        }
    }
}