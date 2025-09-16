using AutoMapper;
using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Entities;
using MeetingRoom.Core.Enums;
using MeetingRoom.Core.Exceptions;
using MeetingRoom.Core.Interfaces;
using System.Text.Json;
using System.Text;

namespace MeetingRoom.Application.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IMeetingRoomRepository _roomRepository;
        private readonly IUserRepository _userRepository;
        private readonly IApprovalService _approvalService;
        private readonly IMapper _mapper;

        public BookingService(
            IBookingRepository bookingRepository,
            IMeetingRoomRepository roomRepository,
            IUserRepository userRepository,
            IApprovalService approvalService,
            IMapper mapper)
        {
            _bookingRepository = bookingRepository;
            _roomRepository = roomRepository;
            _userRepository = userRepository;
            _approvalService = approvalService;
            _mapper = mapper;
        }

        public async Task<BookingResponseDTO> CreateBookingAsync(BookingRequestDTO bookingDto)
        {
            if (bookingDto == null) throw new ArgumentNullException(nameof(bookingDto));

            // Basic validation
            await ValidateBookingTimeAsync(bookingDto.StartTime, bookingDto.EndTime);

            // Check if room exists and is available
            var room = await ValidateRoomAsync(bookingDto.RoomId);

            // Check if user requires approval - employees with managers always need approval
            var organizer = await _userRepository.GetByIdAsync(bookingDto.OrganizerId);
            bool requiresApproval = organizer?.Role == UserRole.Employee && organizer.ManagerId.HasValue;

            // Check for conflicts
            var conflictDetails = await CheckBookingConflictsAsync(bookingDto);

            // Handle room conflicts
            if (conflictDetails.RoomConflicts.Any())
            {
                if (!bookingDto.IsEmergency)
                {
                    var conflictInfo = conflictDetails.RoomConflicts.First();
                    throw new RoomConflictException($"Room is already booked from {conflictInfo.StartTime:HH:mm} to {conflictInfo.EndTime:HH:mm} for '{conflictInfo.BookingTitle}' by {conflictInfo.OrganizerName}");
                }
                else
                {
                    // Cancel non-emergency conflicting bookings
                    await HandleEmergencyBookingAsync(bookingDto.RoomId, bookingDto.StartTime, bookingDto.EndTime);
                }
            }

            // Handle attendee conflicts
            if (conflictDetails.AttendeeConflicts.Any())
            {
                var conflictUsers = string.Join(", ", conflictDetails.AttendeeConflicts.Select(c => c.UserName));
                throw new AttendeeConflictException($"The following attendees are already in meetings: {conflictUsers}");
            }

            if (requiresApproval)
            {
                // Create booking with Pending status first
                var booking = new Booking
                {
                    BookingId = Guid.NewGuid(),
                    RoomId = bookingDto.RoomId,
                    OrganizerId = bookingDto.OrganizerId,
                    Title = bookingDto.Title,
                    StartTime = bookingDto.StartTime,
                    EndTime = bookingDto.EndTime,
                    IsEmergency = bookingDto.IsEmergency,
                    RequiresApproval = true,
                    Status = BookingStatus.Pending,
                    CreatedAt = DateTime.UtcNow,
                    RefreshmentRequests = bookingDto.RefreshmentRequests
                };

                await _bookingRepository.AddAsync(booking);

                // Now create approval request
                await _approvalService.CreateApprovalRequestAsync(booking.BookingId, bookingDto.OrganizerId);
                
                return new BookingResponseDTO
                {
                    BookingId = booking.BookingId,
                    Title = bookingDto.Title,
                    Status = "Requires manager approval to confirm booking",
                    StartTime = bookingDto.StartTime,
                    EndTime = bookingDto.EndTime,
                    RoomName = room.RoomName,
                    OrganizerName = organizer?.UserName ?? "",
                    RoomId = bookingDto.RoomId,
                    OrganizerId = bookingDto.OrganizerId,
                    IsEmergency = bookingDto.IsEmergency,
                    CreatedAt = DateTime.UtcNow,
                    Attendees = new List<AttendeeResponseDTO>()
                };
            }
            else
            {
                // Create booking directly for managers/admins or emergency bookings
                var booking = new Booking
                {
                    BookingId = Guid.NewGuid(),
                    RoomId = bookingDto.RoomId,
                    OrganizerId = bookingDto.OrganizerId,
                    Title = bookingDto.Title,
                    StartTime = bookingDto.StartTime,
                    EndTime = bookingDto.EndTime,
                    IsEmergency = bookingDto.IsEmergency,
                    RequiresApproval = false,
                    Status = BookingStatus.Scheduled,
                    CreatedAt = DateTime.UtcNow,
                    RefreshmentRequests = bookingDto.RefreshmentRequests,
                    Attendees = new List<Attendee>()
                };

                // Add attendees before saving
                foreach (var userId in bookingDto.AttendeeUserIds)
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

                await _bookingRepository.AddAsync(booking);

                return await GetBookingByIdAsync(booking.BookingId) ?? throw new Exception("Failed to retrieve created booking");
            }
        }

        private Task ValidateBookingTimeAsync(DateTime startTime, DateTime endTime)
        {
            if (startTime >= endTime)
                throw new ValidationException("Start time must be before end time");

            if (startTime < DateTime.UtcNow.AddMinutes(-5)) // 5-minute grace period
                throw new ValidationException("Cannot book meetings in the past");

            if ((endTime - startTime).TotalHours > 8)
                throw new ValidationException("Meeting duration cannot exceed 8 hours");

            if ((endTime - startTime).TotalMinutes < 15)
                throw new ValidationException("Meeting duration must be at least 15 minutes");

            // Business hours validation (9 AM to 6 PM)
            if (startTime.Hour < 9 || endTime.Hour > 18)
                throw new ValidationException("Meetings can only be booked between 9 AM and 6 PM");

            return Task.CompletedTask;
        }

        private async Task<MeetingRoomEntity> ValidateRoomAsync(int roomId)
        {
            var room = await _roomRepository.GetByIdAsync(roomId);
            if (room == null)
                throw new NotFoundException($"Meeting room with ID {roomId} not found");

            if (!room.IsAvailable)
                throw new ConflictException("Meeting room is not available for booking");

            return room;
        }

        private async Task<ConflictDetailsDTO> CheckBookingConflictsAsync(BookingRequestDTO bookingDto, Guid? excludeBookingId = null)
        {
            var conflicts = new ConflictDetailsDTO();

            // Add 15-minute buffer before and after
            var bufferStartTime = bookingDto.StartTime.AddMinutes(-15);
            var bufferEndTime = bookingDto.EndTime.AddMinutes(15);

            // Check room conflicts with buffer
            var roomConflicts = await _bookingRepository.GetConflictingBookingsAsync(
                bookingDto.RoomId, bufferStartTime, bufferEndTime);

            if (excludeBookingId.HasValue)
                roomConflicts = roomConflicts.Where(b => b.BookingId != excludeBookingId.Value);

            conflicts.RoomConflicts = roomConflicts.Select(b => new RoomConflictDTO
            {
                BookingId = b.BookingId,
                BookingTitle = b.Title,
                OrganizerName = b.Organizer?.UserName ?? "Unknown",
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                IsEmergency = b.IsEmergency
            }).ToList();

            // Check attendee conflicts (including organizer)
            var allUserIds = bookingDto.AttendeeUserIds.ToList();
            allUserIds.Add(bookingDto.OrganizerId);

            foreach (var userId in allUserIds.Distinct())
            {
                var userConflicts = await _bookingRepository.GetUserConflictingBookingsAsync(
                    userId, bookingDto.StartTime, bookingDto.EndTime, excludeBookingId);

                foreach (var conflict in userConflicts)
                {
                    var user = await _userRepository.GetByIdAsync(userId);
                    conflicts.AttendeeConflicts.Add(new AttendeeConflictDTO
                    {
                        UserId = userId,
                        UserName = user?.UserName ?? "Unknown",
                        ConflictingBookingId = conflict.BookingId,
                        ConflictingBookingTitle = conflict.Title,
                        StartTime = conflict.StartTime,
                        EndTime = conflict.EndTime
                    });
                }
            }

            return conflicts;
        }

        private async Task HandleEmergencyBookingAsync(int roomId, DateTime startTime, DateTime endTime)
        {
            var conflicts = await _bookingRepository.GetConflictingBookingsAsync(roomId, startTime, endTime);
            
            foreach (var conflict in conflicts.Where(c => !c.IsEmergency))
            {
                conflict.Status = BookingStatus.Cancelled;
                await _bookingRepository.UpdateAsync(conflict);
            }
        }

        public async Task<BookingResponseDTO> UpdateBookingAsync(Guid id, BookingRequestDTO bookingDto)
        {
            if (bookingDto == null) throw new ArgumentNullException(nameof(bookingDto));

            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking == null)
                throw new NotFoundException($"Booking with ID {id} not found");

            // Don't allow updating past meetings
            if (booking.StartTime < DateTime.UtcNow.AddMinutes(-15))
                throw new ValidationException("Cannot update meetings that have already started");

            // Basic validation
            await ValidateBookingTimeAsync(bookingDto.StartTime, bookingDto.EndTime);

            // Check if room exists and is available
            await ValidateRoomAsync(bookingDto.RoomId);

            // Check for conflicts (excluding current booking)
            var conflictDetails = await CheckBookingConflictsAsync(bookingDto, id);

            if (conflictDetails.RoomConflicts.Any())
            {
                var conflictInfo = conflictDetails.RoomConflicts.First();
                throw new RoomConflictException($"Room is already booked from {conflictInfo.StartTime:HH:mm} to {conflictInfo.EndTime:HH:mm} for '{conflictInfo.BookingTitle}'");
            }

            if (conflictDetails.AttendeeConflicts.Any())
            {
                var conflictUsers = string.Join(", ", conflictDetails.AttendeeConflicts.Select(c => c.UserName));
                throw new AttendeeConflictException($"The following attendees are already in meetings: {conflictUsers}");
            }

            // Update booking
            booking.RoomId = bookingDto.RoomId;
            booking.Title = bookingDto.Title;
            booking.StartTime = bookingDto.StartTime;
            booking.EndTime = bookingDto.EndTime;
            booking.IsEmergency = bookingDto.IsEmergency;
            booking.UpdatedAt = DateTime.UtcNow;

            await _bookingRepository.UpdateAsync(booking);

            return await GetBookingByIdAsync(id) ?? throw new Exception("Failed to retrieve updated booking");
        }

        public async Task DeleteBookingAsync(Guid id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking == null)
                throw new NotFoundException($"Booking with ID {id} not found");

            await _bookingRepository.DeleteAsync(id);
        }

        public async Task<List<BookingResponseDTO>> GetAllBookingsAsync()
        {
            var bookings = await _bookingRepository.GetAllAsync();
            return _mapper.Map<List<BookingResponseDTO>>(bookings);
        }

        public async Task<BookingResponseDTO?> GetBookingByIdAsync(Guid id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            return booking == null ? null : _mapper.Map<BookingResponseDTO>(booking);
        }

        public async Task<List<BookingResponseDTO>> GetBookingsByRoomIdAsync(int roomId)
        {
            var bookings = await _bookingRepository.GetBookingsByRoomIdAsync(roomId);
            return _mapper.Map<List<BookingResponseDTO>>(bookings);
        }

        public async Task<List<BookingResponseDTO>> GetBookingsByUserIdAsync(int userId)
        {
            var bookings = await _bookingRepository.GetBookingsByUserIdAsync(userId);
            return _mapper.Map<List<BookingResponseDTO>>(bookings);
        }

        public async Task<bool> CheckRoomAvailabilityAsync(int roomId, DateTime startTime, DateTime endTime)
        {
            return await _bookingRepository.IsRoomAvailableAsync(roomId, startTime, endTime);
        }

        public async Task<ConflictDetailsDTO> CheckBookingConflictsAsync(BookingRequestDTO bookingDto)
        {
            return await CheckBookingConflictsAsync(bookingDto, null);
        }

        public async Task CreateApprovalRequestAsync(Guid bookingId, int requesterId)
        {
            await _approvalService.CreateApprovalRequestAsync(bookingId, requesterId);
        }

        public async Task<BookingResponseDTO> EndMeetingEarlyAsync(Guid bookingId, int organizerId)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
                throw new NotFoundException($"Booking with ID {bookingId} not found");

            if (booking.OrganizerId != organizerId)
                throw new ValidationException("Only the organizer can end the meeting early");

            if (booking.Status != BookingStatus.Scheduled)
                throw new ValidationException("Only scheduled meetings can be ended early");

            booking.ActualEndTime = DateTime.UtcNow;
            booking.Status = BookingStatus.Completed;
            booking.UpdatedAt = DateTime.UtcNow;

            await _bookingRepository.UpdateAsync(booking);
            return await GetBookingByIdAsync(bookingId) ?? throw new Exception("Failed to retrieve updated booking");
        }

        public async Task<BookingResponseDTO> ExtendMeetingAsync(Guid bookingId, int organizerId, DateTime newEndTime)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
                throw new NotFoundException($"Booking with ID {bookingId} not found");

            if (booking.OrganizerId != organizerId)
                throw new ValidationException("Only the organizer can extend the meeting");

            if (booking.Status != BookingStatus.Scheduled)
                throw new ValidationException("Only scheduled meetings can be extended");

            // Check for conflicts with extended time
            var conflicts = await _bookingRepository.GetConflictingBookingsAsync(
                booking.RoomId, booking.EndTime, newEndTime.AddMinutes(15));

            if (conflicts.Any(c => c.BookingId != bookingId))
                throw new ConflictException("Cannot extend meeting due to conflicting bookings");

            booking.EndTime = newEndTime;
            booking.UpdatedAt = DateTime.UtcNow;

            await _bookingRepository.UpdateAsync(booking);
            return await GetBookingByIdAsync(bookingId) ?? throw new Exception("Failed to retrieve updated booking");
        }

        public async Task<BookingResponseDTO> CreateBookingFromApprovalAsync(Guid approvalBookingId, BookingRequestDTO bookingDto)
        {
            // Create the actual booking after approval
            var booking = new Booking
            {
                BookingId = Guid.NewGuid(),
                RoomId = bookingDto.RoomId,
                OrganizerId = bookingDto.OrganizerId,
                Title = bookingDto.Title,
                StartTime = bookingDto.StartTime,
                EndTime = bookingDto.EndTime,
                IsEmergency = bookingDto.IsEmergency,
                RequiresApproval = false,
                Status = BookingStatus.Scheduled,
                CreatedAt = DateTime.UtcNow
            };

            await _bookingRepository.AddAsync(booking);
            return await GetBookingByIdAsync(booking.BookingId) ?? throw new Exception("Failed to retrieve created booking");
        }

        public async Task UpdateBookingStatusAsync(Guid bookingId, BookingStatus status)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
                throw new NotFoundException($"Booking with ID {bookingId} not found");

            booking.Status = status;
            booking.UpdatedAt = DateTime.UtcNow;
            await _bookingRepository.UpdateAsync(booking);
        }

        public async Task ProcessCompletedMeetingsAsync()
        {
            var activeBookings = await _bookingRepository.GetActiveBookingsAsync();
            var now = DateTime.UtcNow;

            foreach (var booking in activeBookings.Where(b => b.EndTime < now && b.Status == BookingStatus.Scheduled))
            {
                booking.Status = BookingStatus.Completed;
                booking.UpdatedAt = now;
                await _bookingRepository.UpdateAsync(booking);
            }
        }

        public async Task<(string eventId, string joinUrl)> CreateTeamsEventAsync(Booking booking)
        {
            try
            {
                var organizer = await _userRepository.GetByIdAsync(booking.OrganizerId);
                var room = await _roomRepository.GetByIdAsync(booking.RoomId);
                var attendees = new List<string>();

                foreach (var attendee in booking.Attendees)
                {
                    var user = await _userRepository.GetByIdAsync(attendee.UserId);
                    if (user != null && !string.IsNullOrEmpty(user.Email))
                    {
                        attendees.Add(user.Email);
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
                // Log error but don't fail the booking
                Console.WriteLine($"Failed to create Teams event: {ex.Message}");
                return ("", "");
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