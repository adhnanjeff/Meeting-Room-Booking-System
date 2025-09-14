

namespace MeetingRoom.Core.Exceptions
{
    public class ValidationException : Exception
    {
        // password length or when password does not meet business needs like not using special characters etc..
        public ValidationException(string message) : base(message) {
        } 
    }
}
