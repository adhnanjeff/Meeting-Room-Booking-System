using System.Net;
using System.Net.Mail;

using MeetingRoom.Core.Interfaces;

namespace MeetingRoom.Core.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _smtpHost = "smtp.gmail.com";
        private readonly int _smtpPort = 587;
        private readonly string _fromEmail = "adhnanjeff26@gmail.com"; // Replace with your Gmail
        private readonly string _fromPassword = "bhta vkzh eygb aiee"; // Replace with Gmail app password

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName)
        {
            var subject = "Password Reset Request - SynerRoom";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2>Password Reset Request</h2>
                    <p>Hello {userName},</p>
                    <p>You requested a password reset for your SynerRoom account.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href='https://localhost:4200/reset-password?token={resetToken}' 
                       style='background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
                       Reset Password
                    </a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <br>
                    <p>Best regards,<br>SynerRoom Team</p>
                </body>
                </html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendMeetingInvitationAsync(string toEmail, string meetingTitle, string role, DateTime startTime, string roomName)
        {
            var subject = $"Meeting Invitation: {meetingTitle}";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2>Meeting Invitation</h2>
                    <p>You have been invited as <strong>{role}</strong> to:</p>
                    <h3>{meetingTitle}</h3>
                    <p><strong>Date:</strong> {startTime:MMM dd, yyyy}</p>
                    <p><strong>Time:</strong> {startTime:HH:mm}</p>
                    <p><strong>Location:</strong> {roomName}</p>
                    <p><strong>Your Role:</strong> {role}</p>
                    <br>
                    <p>Please mark your calendar accordingly.</p>
                    <p>Best regards,<br>SynerRoom Team</p>
                </body>
                </html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendPasswordChangedNotificationAsync(string toEmail, string userName)
        {
            var subject = "Password Changed - SynerRoom";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2>Password Changed Successfully</h2>
                    <p>Hello {userName},</p>
                    <p>Your password has been successfully changed for your SynerRoom account.</p>
                    <p>If you didn't make this change, please contact your administrator immediately.</p>
                    <br>
                    <p>Best regards,<br>SynerRoom Team</p>
                </body>
                </html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            using var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                Credentials = new NetworkCredential(_fromEmail, _fromPassword),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_fromEmail, "SynerRoom"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);
            await client.SendMailAsync(mailMessage);
        }
    }
}