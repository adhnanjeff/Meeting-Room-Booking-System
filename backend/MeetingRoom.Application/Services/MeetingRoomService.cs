using AutoMapper;
using MeetingRoom.Core.DTOs;
using MeetingRoom.Core.Entities;
using MeetingRoom.Core.Interfaces;

namespace MeetingRoom.Application.Services
{
    public class MeetingRoomService : IMeetingRoomService
    {
        private readonly IMeetingRoomRepository _repository;
        private readonly IMapper _mapper;

        public MeetingRoomService(IMeetingRoomRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task UpdateRoomAsync(int id, MeetingRoomRequestDTO roomDto)
        {
            if (roomDto == null) throw new ArgumentNullException(nameof(roomDto));
            
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                throw new KeyNotFoundException($"Room with ID {id} not found.");

            _mapper.Map(roomDto, entity);
            await _repository.UpdateAsync(entity);
        }

        public async Task<MeetingRoomResponseDTO> CreateRoomAsync(MeetingRoomRequestDTO roomDto)
        {
            if (roomDto == null) throw new ArgumentNullException(nameof(roomDto));
            
            var entity = _mapper.Map<MeetingRoomEntity>(roomDto);
            entity.IsAvailable = true;
            await _repository.AddAsync(entity);
            return _mapper.Map<MeetingRoomResponseDTO>(entity);
        }

        public async Task DeleteRoomAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }

        public async Task<List<MeetingRoomResponseDTO>> GetAllRoomsAsync()
        {
            var entities = await _repository.GetAllAsync();
            return _mapper.Map<List<MeetingRoomResponseDTO>>(entities);
        }

        public async Task<MeetingRoomResponseDTO?> GetRoomByIdAsync(int id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? null : _mapper.Map<MeetingRoomResponseDTO>(entity);
        }
    }
}
