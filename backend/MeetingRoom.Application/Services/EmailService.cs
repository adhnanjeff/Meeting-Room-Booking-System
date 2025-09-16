using MeetingRoom.Core.Interfaces;
using System.Net;
using System.Net.Mail;

namespace MeetingRoom.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendPasswordResetEmailAsync(string email, string resetToken)
        {
            var resetUrl = $"{_configuration["Frontend:BaseUrl"]}/reset-password?token={resetToken}&email={email}";
            
            var subject = "Password Reset Request - SynerRoom";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #3b82f6;'>Password Reset Request</h2>
                        <p>You have requested to reset your password for your SynerRoom account.</p>
                        <p>Click the button below to reset your password:</p>
                        <a href='{resetUrl}' style='display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;'>Reset Password</a>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style='word-break: break-all; color: #6b7280;'>{resetUrl}</p>
                        <p style='margin-top: 30px; color: #6b7280; font-size: 14px;'>
                            This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
                        </p>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendPasswordChangedNotificationAsync(string email)
        {
            var subject = "Password Changed Successfully - SynerRoom";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #10b981;'>Password Changed Successfully</h2>
                        <p>Your password has been successfully changed for your SynerRoom account.</p>
                        <p>If you didn't make this change, please contact your administrator immediately.</p>
                        <p style='margin-top: 30px; color: #6b7280; font-size: 14px;'>
                            This is an automated message. Please do not reply to this email.
                        </p>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body);
        }

        private async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("Smtp");
                
                using var client = new SmtpClient(smtpSettings["Host"], int.Parse(smtpSettings["Port"]))
                {
                    Credentials = new NetworkCredential(smtpSettings["Username"], smtpSettings["Password"]),
                    EnableSsl = bool.Parse(smtpSettings["EnableSsl"])
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(smtpSettings["FromEmail"], "SynerRoom"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(to);
                await client.SendMailAsync(mailMessage);
            }
            catch (Exception ex)
            {
                // Log error but don't throw to prevent breaking the flow
                Console.WriteLine($"Failed to send email: {ex.Message}");
            }
        }
    }
}