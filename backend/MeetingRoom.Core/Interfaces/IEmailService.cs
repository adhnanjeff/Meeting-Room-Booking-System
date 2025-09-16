namespace MeetingRoom.Core.Interfaces
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string email, string resetToken);
        Task SendPasswordChangedNotificationAsync(string email);
    }
}