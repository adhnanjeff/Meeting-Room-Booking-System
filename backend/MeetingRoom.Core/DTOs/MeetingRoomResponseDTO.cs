using MeetingRoom.Core.Entities;

namespace MeetingRoom.Core.DTOs
{
    public class MeetingRoomResponseDTO
    {
        public int Id { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string Amenities { get; set; } = string.Empty;
        public bool IsAvailable { get; set; } = true;
        public string PriorityLevel { get; set; } = string.Empty;
    }
}
