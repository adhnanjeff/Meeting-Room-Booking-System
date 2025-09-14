namespace MeetingRoom.Core.Exceptions
{
    public class AttendeeConflictException : Exception
    {
        public AttendeeConflictException(string message) : base(message) { }
        public AttendeeConflictException(string message, Exception innerException) : base(message, innerException) { }
    }
}