using Microsoft.AspNetCore.Mvc;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Azure.Identity;

namespace MeetingRoom.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MicrosoftGraphController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly GraphServiceClient _graphClient;

        public MicrosoftGraphController(IConfiguration configuration)
        {
            _configuration = configuration;
            _graphClient = GetGraphServiceClient();
        }

        [HttpPost("create-event")]
        public async Task<IActionResult> CreateTeamsEvent([FromBody] TeamsEventRequest request)
        {
            try
            {
                // Check if Microsoft Graph credentials are configured
                if (_graphClient == null)
                {
                    return BadRequest(new { message = "Microsoft Graph credentials not configured. Teams integration unavailable." });
                }
                var @event = new Event
                {
                    Subject = request.Subject,
                    Body = new ItemBody
                    {
                        ContentType = BodyType.Html,
                        Content = request.Body
                    },
                    Start = new DateTimeTimeZone
                    {
                        DateTime = request.StartDateTime,
                        TimeZone = request.TimeZone
                    },
                    End = new DateTimeTimeZone
                    {
                        DateTime = request.EndDateTime,
                        TimeZone = request.TimeZone
                    },
                    Location = new Location
                    {
                        DisplayName = request.Location
                    },
                    Attendees = request.Attendees.Select(email => new Attendee
                    {
                        EmailAddress = new EmailAddress
                        {
                            Address = email,
                            Name = email.Split('@')[0]
                        },
                        Type = AttendeeType.Required
                    }).ToList(),
                    IsOnlineMeeting = true,
                    OnlineMeetingProvider = OnlineMeetingProviderType.TeamsForBusiness
                };

                var createdEvent = await _graphClient.Users[request.OrganizerEmail].Events
                    .PostAsync(@event);

                return Ok(new TeamsEventResponse
                {
                    Id = createdEvent.Id,
                    WebLink = createdEvent.WebLink,
                    JoinUrl = createdEvent.OnlineMeeting?.JoinUrl
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("delete-event/{eventId}")]
        public async Task<IActionResult> DeleteTeamsEvent(string eventId, [FromQuery] string organizerEmail)
        {
            try
            {
                // Check if Microsoft Graph credentials are configured
                if (_graphClient == null)
                {
                    return BadRequest(new { message = "Microsoft Graph credentials not configured. Teams integration unavailable." });
                }
                await _graphClient.Users[organizerEmail].Events[eventId]
                    .DeleteAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private GraphServiceClient GetGraphServiceClient()
        {
            var tenantId = _configuration["AzureAd:TenantId"];
            var clientId = _configuration["AzureAd:ClientId"];
            var clientSecret = _configuration["AzureAd:ClientSecret"];

            if (string.IsNullOrEmpty(tenantId) || string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            {
                return null; // Return null if credentials are not configured
            }

            var credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
            return new GraphServiceClient(credential);
        }
    }

    public class TeamsEventRequest
    {
        public string Subject { get; set; }
        public string Body { get; set; }
        public string StartDateTime { get; set; }
        public string EndDateTime { get; set; }
        public string TimeZone { get; set; } = "UTC";
        public string Location { get; set; }
        public List<string> Attendees { get; set; } = new();
        public string OrganizerEmail { get; set; }
    }

    public class TeamsEventResponse
    {
        public string Id { get; set; }
        public string WebLink { get; set; }
        public string JoinUrl { get; set; }
    }
}