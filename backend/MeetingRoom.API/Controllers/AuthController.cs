using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Entities;
using MeetingRoom.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly RoleManager<IdentityRole<int>> _roleManager;
    private readonly IConfiguration _config;
    private readonly IEmailService _emailService;

    public AuthController(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        RoleManager<IdentityRole<int>> roleManager,
        IConfiguration config,
        IEmailService emailService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
        _config = config;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequestDTO dto)
    {
        try
        {
            // Parse role from string name
            if (!Enum.TryParse<MeetingRoom.Core.Enums.UserRole>(dto.Role, true, out var roleEnum))
            {
                return BadRequest("Invalid role. Use: Employee, Manager, or Admin");
            }

            var roleName = roleEnum.ToString();

            var user = new AppUser
            {
                UserName = dto.UserName,
                Email = dto.Email,
                Department = dto.Department,
                Role = roleEnum,
                ManagerId = dto.ManagerId
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // Check if role exists, if not create it
            if (!await _roleManager.RoleExistsAsync(roleName))
                await _roleManager.CreateAsync(new IdentityRole<int> { Name = roleName });

            // Add user to role
            await _userManager.AddToRoleAsync(user, roleName);

            return Ok(new { message = "User registered successfully with role", role = roleName });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Registration failed", error = ex.Message });
        }
    }


    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDTO dto)
    {
        if (dto == null || string.IsNullOrEmpty(dto.UserName) || string.IsNullOrEmpty(dto.Password))
            return BadRequest("Username and password are required");

        var user = await _userManager.FindByNameAsync(dto.UserName);
        if (user == null) return Unauthorized("Invalid credentials");

        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!result.Succeeded) return Unauthorized("Invalid credentials");

        var (token, expiration) = await GenerateJwtToken(user);

        return Ok(new
        {
            token = token,
            expiresAt = expiration.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        });
    }

    private async Task<(string Token, DateTime Expiration)> GenerateJwtToken(AppUser user)
    {
        var jwtSettings = _config.GetSection("Jwt");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var userRoles = await _userManager.GetRolesAsync(user);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserName ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim("UserId", user.Id.ToString()),
            new Claim("UserName", user.UserName ?? ""),
            new Claim("Email", user.Email ?? ""),
            new Claim("Department", user.Department ?? ""),
            new Claim("role", ((int)user.Role).ToString()) // Use the Role enum value as number
        };

        // Add Identity roles as well for compatibility
        claims.AddRange(userRoles.Select(role => new Claim(ClaimTypes.Role, role)));

        var expiration = DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["ExpireMinutes"]));

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: expiration,
            signingCredentials: credentials
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiration);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] PasswordResetRequestDTO dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return Ok(new { message = "If the email exists, a reset link has been sent." });

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        await _emailService.SendPasswordResetEmailAsync(dto.Email, token, user.UserName ?? "User");

        return Ok(new { message = "If the email exists, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return BadRequest("Invalid reset request.");

        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await _emailService.SendPasswordChangedNotificationAsync(dto.Email, user.UserName ?? "User");
        return Ok(new { message = "Password reset successfully." });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
    {
        var userId = User.FindFirst("UserId")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound("User not found.");

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await _emailService.SendPasswordChangedNotificationAsync(user.Email!, user.UserName ?? "User");
        return Ok(new { message = "Password changed successfully." });
    }
}
