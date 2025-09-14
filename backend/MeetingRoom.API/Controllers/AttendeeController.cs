using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Exceptions;
using MeetingRoom.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MeetingRoom.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendeeController : ControllerBase
    {
        private readonly IAttendeeService _attendeeService;

        public AttendeeController(IAttendeeService attendeeService)
        {
            _attendeeService = attendeeService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AttendeeResponseDTO>> GetAttendeeById(int id)
        {
            var attendee = await _attendeeService.GetAttendeeByIdAsync(id);
            if (attendee == null)
                return NotFound();

            return Ok(attendee);
        }

        [HttpGet("booking/{bookingId}")]
        public async Task<ActionResult<List<AttendeeResponseDTO>>> GetAttendeesByBooking(Guid bookingId)
        {
            var attendees = await _attendeeService.GetAttendeesByBookingIdAsync(bookingId);
            return Ok(attendees);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<AttendeeResponseDTO>>> GetAttendeesByUser(int userId)
        {
            var attendees = await _attendeeService.GetAttendeesByUserIdAsync(userId);
            return Ok(attendees);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<AttendeeResponseDTO>> UpdateAttendeeStatus(int id, [FromBody] AttendeeUpdateDTO updateDto)
        {
            try
            {
                var updatedAttendee = await _attendeeService.UpdateAttendeeStatusAsync(id, updateDto);
                return Ok(updatedAttendee);
            }
            catch (NotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}/accept")]
        public async Task<ActionResult<AttendeeResponseDTO>> AcceptMeeting(int id)
        {
            try
            {
                var updateDto = new AttendeeUpdateDTO { Status = Core.Enums.AttendeeStatus.Accepted };
                var updatedAttendee = await _attendeeService.UpdateAttendeeStatusAsync(id, updateDto);
                return Ok(updatedAttendee);
            }
            catch (NotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPut("{id}/decline")]
        public async Task<ActionResult<AttendeeResponseDTO>> DeclineMeeting(int id)
        {
            try
            {
                var updateDto = new AttendeeUpdateDTO { Status = Core.Enums.AttendeeStatus.Declined };
                var updatedAttendee = await _attendeeService.UpdateAttendeeStatusAsync(id, updateDto);
                return Ok(updatedAttendee);
            }
            catch (NotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("invitations/{userId}")]
        public async Task<ActionResult<List<AttendeeResponseDTO>>> GetUserInvitations(int userId)
        {
            var attendees = await _attendeeService.GetAttendeesByUserIdAsync(userId);
            return Ok(attendees.Where(a => a.Status == Core.Enums.AttendeeStatus.Pending).ToList());
        }
    }
}