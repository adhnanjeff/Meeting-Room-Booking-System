using AutoMapper;
using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Exceptions;
using MeetingRoom.Core.Interfaces;

namespace MeetingRoom.Application.Services
{
    public class AttendeeService : IAttendeeService
    {
        private readonly IAttendeeRepository _attendeeRepository;
        private readonly IMapper _mapper;

        public AttendeeService(IAttendeeRepository attendeeRepository, IMapper mapper)
        {
            _attendeeRepository = attendeeRepository;
            _mapper = mapper;
        }

        public async Task<AttendeeResponseDTO?> UpdateAttendeeStatusAsync(int attendeeId, AttendeeUpdateDTO updateDto)
        {
            if (updateDto == null) throw new ArgumentNullException(nameof(updateDto));

            var attendee = await _attendeeRepository.GetByIdAsync(attendeeId);
            if (attendee == null)
                throw new NotFoundException($"Attendee with ID {attendeeId} not found");

            attendee.Status = updateDto.Status;
            if (!string.IsNullOrEmpty(updateDto.RoleInMeeting))
            {
                attendee.RoleInMeeting = updateDto.RoleInMeeting;
            }

            await _attendeeRepository.UpdateAsync(attendee);

            return _mapper.Map<AttendeeResponseDTO>(attendee);
        }

        public async Task<List<AttendeeResponseDTO>> GetAttendeesByBookingIdAsync(Guid bookingId)
        {
            var attendees = await _attendeeRepository.GetAttendeesByBookingIdAsync(bookingId);
            return _mapper.Map<List<AttendeeResponseDTO>>(attendees);
        }

        public async Task<List<AttendeeResponseDTO>> GetAttendeesByUserIdAsync(int userId)
        {
            var attendees = await _attendeeRepository.GetAttendeesByUserIdAsync(userId);
            return _mapper.Map<List<AttendeeResponseDTO>>(attendees);
        }

        public async Task<AttendeeResponseDTO?> GetAttendeeByIdAsync(int attendeeId)
        {
            var attendee = await _attendeeRepository.GetByIdAsync(attendeeId);
            return attendee == null ? null : _mapper.Map<AttendeeResponseDTO>(attendee);
        }
    }
}