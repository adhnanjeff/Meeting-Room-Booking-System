

namespace MeetingRoom.Core.Exceptions
{
    public class UnauthorizedException : Exception
    {

        // Tyring to access data when not logged in or invalid credentials
        public UnauthorizedException() { }

        public UnauthorizedException(string message) : base(message) { }

        public UnauthorizedException(string message, Exception innerException)
            : base(message, innerException) { }
    }
}
