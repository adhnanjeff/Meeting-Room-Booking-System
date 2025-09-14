

using System;
using System.Security;

namespace MeetingRoom.Core.Exceptions
{
    public class ForbiddenException : Exception
    {

        //Meaning: The client is authenticated, but doesn’t have permission.

        //When to throw:If a normal user tries to perform an admin-only action.
        public ForbiddenException() { }

        public ForbiddenException(string message) : base(message) { }

        public ForbiddenException(string message, Exception innerException)
            : base(message, innerException) { }
    }
}
