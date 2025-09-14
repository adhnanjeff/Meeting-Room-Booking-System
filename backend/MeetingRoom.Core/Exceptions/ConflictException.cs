

namespace MeetingRoom.Core.Exceptions
{
    public class ConflictException : Exception
    {
        //Meaning: The request conflicts with the current state of the server.
        //When to throw: When trying to create a resource that already exists. When handling concurrency issues (e.g., two users editing the same record).
        public ConflictException() { }

        public ConflictException(string message) : base(message) { }

        public ConflictException(string message, Exception innerException)
            : base(message, innerException) { }
    }
}
