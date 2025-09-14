
using AutoMapper;
using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Entities;
using MeetingRoom.Core.Enums;

public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // MeetingRoomEntity → MeetingRoomResponseDTO
            CreateMap<MeetingRoomEntity, MeetingRoomResponseDTO>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.RoomId));

            // MeetingRoomRequestDTO → MeetingRoomEntity
            CreateMap<MeetingRoomRequestDTO, MeetingRoomEntity>();

            // UserRequestDTO → AppUser
            CreateMap<UserRequestDTO, AppUser>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());
            
        CreateMap<RegisterRequestDTO, AppUser>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());

        CreateMap<AppUser, UserResponseDTO>()
            .ForMember(dest => dest.UserRole, opt => opt.MapFrom(src => src.Role))
            .ForMember(dest => dest.Roles, opt => opt.Ignore());

        CreateMap<Booking, BookingResponseDTO>()
            .ForMember(dest => dest.RoomName, opt => opt.MapFrom(src => src.Room != null ? src.Room.RoomName : ""))
            .ForMember(dest => dest.OrganizerName, opt => opt.MapFrom(src => src.Organizer != null ? src.Organizer.UserName : ""))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.ApprovalStatus, opt => opt.MapFrom(src => 
                src.Status == BookingStatus.Pending ? "Pending" :
                src.Status == BookingStatus.Scheduled ? "Approved" :
                src.Status == BookingStatus.Cancelled ? "Rejected" : src.Status.ToString()));

        CreateMap<Attendee, AttendeeResponseDTO>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
            .ForMember(dest => dest.BookingTitle, opt => opt.MapFrom(src => src.Booking.Title))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status));

        CreateMap<AttendeeUpdateDTO, Attendee>();

        CreateMap<BookingRequestDTO, Booking>()
            .ForMember(dest => dest.BookingId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => BookingStatus.Pending));

        CreateMap<BookingApproval, ApprovalResponseDTO>()
            .ForMember(dest => dest.BookingTitle, opt => opt.MapFrom(src => src.Booking != null ? src.Booking.Title : ""))
            .ForMember(dest => dest.RequesterName, opt => opt.MapFrom(src => src.Requester != null ? src.Requester.UserName : ""))
            .ForMember(dest => dest.ApproverName, opt => opt.MapFrom(src => src.Approver != null ? src.Approver.UserName : ""))
            .ForMember(dest => dest.MeetingStartTime, opt => opt.MapFrom(src => src.Booking != null ? src.Booking.StartTime : DateTime.MinValue))
            .ForMember(dest => dest.MeetingEndTime, opt => opt.MapFrom(src => src.Booking != null ? src.Booking.EndTime : DateTime.MinValue))
            .ForMember(dest => dest.RoomName, opt => opt.MapFrom(src => src.Booking != null && src.Booking.Room != null ? src.Booking.Room.RoomName : ""))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status));
        }
    }