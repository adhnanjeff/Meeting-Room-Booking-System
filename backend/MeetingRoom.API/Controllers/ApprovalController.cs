using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Exceptions;
using MeetingRoom.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MeetingRoom.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApprovalController : ControllerBase
    {
        private readonly IApprovalService _approvalService;

        public ApprovalController(IApprovalService approvalService)
        {
            _approvalService = approvalService;
        }

        [HttpGet("pending/{managerId}")]
        public async Task<ActionResult<List<ApprovalResponseDTO>>> GetPendingApprovals(int managerId)
        {
            var approvals = await _approvalService.GetPendingApprovalsAsync(managerId);
            return Ok(approvals);
        }

        [HttpGet("all/{managerId}")]
        public async Task<ActionResult<List<ApprovalResponseDTO>>> GetAllApprovals(int managerId)
        {
            var approvals = await _approvalService.GetAllApprovalsAsync(managerId);
            return Ok(approvals);
        }

        [HttpPost("request")]
        public async Task<ActionResult<ApprovalResponseDTO>> CreateApprovalRequest([FromBody] BookingRequestDTO bookingRequest)
        {
            try
            {
                var approval = await _approvalService.CreateApprovalRequestAsync(bookingRequest);
                return Ok(approval);
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { error = "Validation Error", message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApprovalResponseDTO>> ProcessApproval(int id, [FromBody] ApprovalRequestDTO request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userId = int.Parse(userIdClaim ?? "0");
                var result = await _approvalService.ProcessApprovalAsync(id, request, userId);
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

        [HttpPut("{id}/suggest-room")]
        public async Task<ActionResult<ApprovalResponseDTO>> SuggestAlternativeRoom(int id, [FromBody] RoomSuggestionDTO suggestion)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userId = int.Parse(userIdClaim ?? "0");
                var result = await _approvalService.SuggestAlternativeRoomAsync(id, suggestion, userId);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { error = "Not Found", message = ex.Message });
            }
        }
    }
}