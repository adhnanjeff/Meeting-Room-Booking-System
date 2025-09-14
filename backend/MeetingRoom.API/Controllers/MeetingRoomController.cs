using Microsoft.AspNetCore.Mvc;
using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Interfaces;

namespace MeetingRoom.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingRoomController : ControllerBase
    {
        private readonly IMeetingRoomService _service;

        public MeetingRoomController(IMeetingRoomService service)
        {
            _service = service;
        }

        // GET: api/MeetingRoom
        [HttpGet]
        public async Task<ActionResult<List<MeetingRoomResponseDTO>>> GetAllRooms()
        {
            var rooms = await _service.GetAllRoomsAsync();
            return Ok(rooms);
        }

        // GET: api/MeetingRoom/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<MeetingRoomResponseDTO>> GetRoomById(int id)
        {
            var room = await _service.GetRoomByIdAsync(id);
            if (room == null) return NotFound();
            return Ok(room);
        }

        // POST: api/MeetingRoom
        [HttpPost]
        public async Task<ActionResult<MeetingRoomResponseDTO>> CreateRoom([FromBody] MeetingRoomRequestDTO roomDto)
        {
            try
            {
                var createdRoom = await _service.CreateRoomAsync(roomDto);
                return CreatedAtAction(nameof(GetRoomById), new { id = createdRoom.Id }, createdRoom);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/MeetingRoom/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] MeetingRoomRequestDTO roomDto)
        {
            try
            {
                await _service.UpdateRoomAsync(id, roomDto);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/MeetingRoom/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            try
            {
                await _service.DeleteRoomAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
