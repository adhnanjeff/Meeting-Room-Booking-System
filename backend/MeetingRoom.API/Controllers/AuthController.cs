using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Entities;
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

    public AuthController(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        RoleManager<IdentityRole<int>> roleManager,
        IConfiguration config)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
        _config = config;
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
}
