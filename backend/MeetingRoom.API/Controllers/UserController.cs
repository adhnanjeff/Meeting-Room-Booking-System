using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MeetingRoom.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] // 🔐 Require JWT authentication for all endpoints
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }


        [HttpGet]
        // [Authorize(Roles = "Admin")] // 🔐 Only Admin can view all users
        public async Task<ActionResult<IEnumerable<UserResponseDTO>>> GetAll()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDTO>> GetById(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpGet("{id}/profile")]
        public async Task<ActionResult<UserProfileDTO>> GetUserProfile(int id)
        {
            var profile = await _userService.GetUserProfileAsync(id);
            if (profile == null)
                return NotFound();

            return Ok(profile);
        }

        [HttpGet("profile/{username}")]
        public async Task<ActionResult<UserProfileDTO>> GetUserProfileByUsername(string username)
        {
            var profile = await _userService.GetUserProfileByUsernameAsync(username);
            if (profile == null)
                return NotFound();

            return Ok(profile);
        }

        [HttpPut("{id}/profile")]
        public async Task<ActionResult<UserProfileDTO>> UpdateUserProfile(int id, [FromBody] UpdateUserProfileDTO updateDto)
        {
            try
            {
                var profile = await _userService.UpdateUserProfileAsync(id, updateDto);
                return Ok(profile);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPut("{id}/employee")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<ActionResult<UserProfileDTO>> UpdateEmployee(int id, [FromBody] UpdateEmployeeDTO updateDto)
        {
            try
            {
                var profile = await _userService.UpdateEmployeeAsync(id, updateDto);
                return Ok(profile);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult<UserResponseDTO>> Create([FromBody] UserRequestDTO user)
        {
            try
            {
                var createdUser = await _userService.CreateUserAsync(user);
                return CreatedAtAction(nameof(GetById), new { id = createdUser.Id }, createdUser);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserRequestDTO user)
        {
            try
            {
                await _userService.UpdateUserAsync(id, user);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        // [Authorize(Roles = "Admin")] // 🔐 Only Admin can delete users
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _userService.DeleteUserAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPatch("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] int roleValue)
        {
            try
            {
                await _userService.UpdateUserRoleAsync(id, roleValue);
                return Ok(new { message = "Role updated successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("team/{managerId}")]
        public async Task<ActionResult<IEnumerable<UserResponseDTO>>> GetTeamMembers(int managerId)
        {
            var teamMembers = await _userService.GetTeamMembersAsync(managerId);
            return Ok(teamMembers);
        }
    }
}
