using AutoMapper;
using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Entities;
using MeetingRoom.Core.Enums;
using MeetingRoom.Core.Exceptions;
using MeetingRoom.Core.Interfaces;
using MeetingRoom.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text;

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
                
                // Create Teams meeting when approved
                var (eventId, joinUrl) = await CreateTeamsEventAsync(approval.Booking);
                approval.Booking.TeamsEventId = eventId;
                approval.Booking.TeamsJoinUrl = joinUrl;
                
                // Send approval notification to organizer
                await SendApprovalNotificationAsync(approval.Booking, approver?.UserName ?? "Manager");
                
                // Send meeting invitations to attendees (excluding organizer)
                await SendMeetingInvitationsAsync(approval.Booking);
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

            // Add attendees with their roles
            for (int i = 0; i < bookingRequest.AttendeeUserIds.Count; i++)
            {
                var userId = bookingRequest.AttendeeUserIds[i];
                var role = i < bookingRequest.AttendeeRoles?.Count ? bookingRequest.AttendeeRoles[i] : "Participant";
                
                var attendee = new Attendee
                {
                    BookingId = booking.BookingId,
                    UserId = userId,
                    Status = AttendeeStatus.Pending,
                    RoleInMeeting = role
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

        private async Task<(string eventId, string joinUrl)> CreateTeamsEventAsync(Booking booking)
        {
            try
            {
                var organizer = await _context.Users.FindAsync(booking.OrganizerId);
                var room = await _context.MeetingRooms.FindAsync(booking.RoomId);
                var attendees = new List<string>();

                var bookingAttendees = await _context.Attendees
                    .Include(a => a.User)
                    .Where(a => a.BookingId == booking.BookingId)
                    .ToListAsync();

                foreach (var attendee in bookingAttendees)
                {
                    if (!string.IsNullOrEmpty(attendee.User?.Email))
                    {
                        attendees.Add(attendee.User.Email);
                    }
                }

                var teamsRequest = new
                {
                    Subject = booking.Title,
                    Body = $"Meeting in {room?.RoomName}. Created via SynerRoom booking system.",
                    StartDateTime = booking.StartTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    EndDateTime = booking.EndTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    TimeZone = "UTC",
                    Location = room?.RoomName ?? "Meeting Room",
                    Attendees = attendees,
                    OrganizerEmail = organizer?.Email ?? "noreply@company.com"
                };

                using var httpClient = new HttpClient();
                var json = JsonSerializer.Serialize(teamsRequest);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await httpClient.PostAsync("https://localhost:7273/api/MicrosoftGraph/create-event", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var teamsResponse = JsonSerializer.Deserialize<TeamsEventResponse>(responseContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    return (teamsResponse?.Id ?? "", teamsResponse?.JoinUrl ?? "");
                }
                
                return ("", "");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to create Teams event: {ex.Message}");
                return ("", "");
            }
        }

        private async Task SendApprovalNotificationAsync(Booking booking, string approverName)
        {
            try
            {
                var room = await _context.MeetingRooms.FindAsync(booking.RoomId);
                
                var notification = new Notification
                {
                    Title = "Meeting Request Approved",
                    Message = $"Your meeting request '{booking.Title}' has been approved by {approverName} for {booking.StartTime:MMM dd, yyyy} at {booking.StartTime:HH:mm} in {room?.RoomName}",
                    FromUser = approverName,
                    UserId = booking.OrganizerId,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send approval notification: {ex.Message}");
            }
        }

        private async Task SendMeetingInvitationsAsync(Booking booking)
        {
            try
            {
                var attendees = await _context.Attendees
                    .Include(a => a.User)
                    .Where(a => a.BookingId == booking.BookingId && a.UserId != booking.OrganizerId)
                    .ToListAsync();

                var organizer = await _context.Users.FindAsync(booking.OrganizerId);
                var room = await _context.MeetingRooms.FindAsync(booking.RoomId);

                foreach (var attendee in attendees)
                {
                    if (attendee.User != null)
                    {
                        var notification = new Notification
                        {
                            Title = "Meeting Invitation",
                            Message = $"You are a {attendee.RoleInMeeting} in '{booking.Title}' on {booking.StartTime:MMM dd, yyyy} at {booking.StartTime:HH:mm} in {room?.RoomName}",
                            FromUser = organizer?.UserName ?? "System",
                            UserId = attendee.UserId,
                            CreatedAt = DateTime.UtcNow,
                            IsRead = false
                        };

                        _context.Notifications.Add(notification);
                    }
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send meeting invitations: {ex.Message}");
            }
        }

        private class TeamsEventResponse
        {
            public string Id { get; set; } = "";
            public string WebLink { get; set; } = "";
            public string JoinUrl { get; set; } = "";
        }
    }
}