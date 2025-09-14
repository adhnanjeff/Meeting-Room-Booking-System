using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Exceptions;
using MeetingRoom.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MeetingRoom.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet]
        public async Task<ActionResult<List<BookingResponseDTO>>> GetAllBookings()
        {
            var bookings = await _bookingService.GetAllBookingsAsync();
            return Ok(bookings);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookingResponseDTO>> GetBookingById(Guid id)
        {
            var booking = await _bookingService.GetBookingByIdAsync(id);
            if (booking == null)
                return NotFound();

            return Ok(booking);
        }

        [HttpGet("room/{roomId}")]
        public async Task<ActionResult<List<BookingResponseDTO>>> GetBookingsByRoom(int roomId)
        {
            var bookings = await _bookingService.GetBookingsByRoomIdAsync(roomId);
            return Ok(bookings);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<BookingResponseDTO>>> GetBookingsByUser(int userId)
        {
            var bookings = await _bookingService.GetBookingsByUserIdAsync(userId);
            return Ok(bookings);
        }

        [HttpGet("availability")]
        public async Task<ActionResult<bool>> CheckRoomAvailability(
            [FromQuery] int roomId,
            [FromQuery] DateTime startTime,
            [FromQuery] DateTime endTime)
        {
            var isAvailable = await _bookingService.CheckRoomAvailabilityAsync(roomId, startTime, endTime);
            return Ok(new { IsAvailable = isAvailable });
        }

        [HttpPost("check-conflicts")]
        public async Task<ActionResult<ConflictDetailsDTO>> CheckBookingConflicts([FromBody] BookingRequestDTO bookingDto)
        {
            try
            {
                var conflicts = await _bookingService.CheckBookingConflictsAsync(bookingDto);
                return Ok(conflicts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Validation Error", message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<BookingResponseDTO>> CreateBooking([FromBody] BookingRequestDTO bookingDto)
        {
            try
            {
                // Route to approval service for employee requests
                var approvalService = HttpContext.RequestServices.GetRequiredService<IApprovalService>();
                var approval = await approvalService.CreateApprovalRequestAsync(bookingDto);
                return Ok(new BookingResponseDTO 
                {
                    BookingId = approval.BookingId,
                    Title = approval.BookingTitle,
                    Status = "Pending",
                    StartTime = approval.MeetingStartTime,
                    EndTime = approval.MeetingEndTime,
                    RoomName = approval.RoomName,
                    OrganizerName = approval.RequesterName
                });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { error = "Validation Error", message = ex.Message });
            }
            catch (RoomConflictException ex)
            {
                return Conflict(new { error = "Room Conflict", message = ex.Message });
            }
            catch (AttendeeConflictException ex)
            {
                return Conflict(new { error = "Attendee Conflict", message = ex.Message });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { error = "Not Found", message = ex.Message });
            }
            catch (ConflictException ex)
            {
                return Conflict(new { error = "Conflict", message = ex.Message });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { error = "Invalid Input", message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBooking(Guid id, [FromBody] BookingRequestDTO bookingDto)
        {
            try
            {
                await _bookingService.UpdateBookingAsync(id, bookingDto);
                return NoContent();
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { error = "Validation Error", message = ex.Message });
            }
            catch (RoomConflictException ex)
            {
                return Conflict(new { error = "Room Conflict", message = ex.Message });
            }
            catch (AttendeeConflictException ex)
            {
                return Conflict(new { error = "Attendee Conflict", message = ex.Message });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { error = "Not Found", message = ex.Message });
            }
            catch (ConflictException ex)
            {
                return Conflict(new { error = "Conflict", message = ex.Message });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { error = "Invalid Input", message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> DeleteBooking(Guid id)
        {
            try
            {
                await _bookingService.DeleteBookingAsync(id);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(Guid id)
        {
            try
            {
                await _bookingService.DeleteBookingAsync(id);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPut("{id}/end")]
        public async Task<ActionResult<BookingResponseDTO>> EndMeetingEarly(Guid id, [FromQuery] int organizerId)
        {
            try
            {
                var result = await _bookingService.EndMeetingEarlyAsync(id, organizerId);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { error = "Not Found", message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { error = "Validation Error", message = ex.Message });
            }
        }

        [HttpPut("{id}/extend")]
        public async Task<ActionResult<BookingResponseDTO>> ExtendMeeting(Guid id, [FromQuery] int organizerId, [FromQuery] DateTime newEndTime)
        {
            try
            {
                var result = await _bookingService.ExtendMeetingAsync(id, organizerId, newEndTime);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { error = "Not Found", message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { error = "Validation Error", message = ex.Message });
            }
            catch (ConflictException ex)
            {
                return Conflict(new { error = "Conflict", message = ex.Message });
            }
        }
    }
}