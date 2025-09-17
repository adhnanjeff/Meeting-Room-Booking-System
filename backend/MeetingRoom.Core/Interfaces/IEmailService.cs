namespace MeetingRoom.Core.Interfaces
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName);
        Task SendMeetingInvitationAsync(string toEmail, string meetingTitle, string role, DateTime startTime, string roomName);
        Task SendPasswordChangedNotificationAsync(string toEmail, string userName);
    }
}