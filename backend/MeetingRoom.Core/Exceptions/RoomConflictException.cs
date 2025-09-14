namespace MeetingRoom.Core.Exceptions
{
    public class RoomConflictException : Exception
    {
        public RoomConflictException(string message) : base(message) { }
        public RoomConflictException(string message, Exception innerException) : base(message, innerException) { }
    }
}