-- Force drop PriorityLevel column
ALTER TABLE MeetingRooms DROP COLUMN PriorityLevel;

-- Insert meeting rooms data
INSERT INTO MeetingRooms (RoomName, Capacity, Amenities, IsAvailable)
VALUES 
('Kabini', 4, 'Whiteboard, Projector', 1),
('Mahanadi', 6, 'Whiteboard, Projector, Conference Phone', 1),
('Brahmaputra', 10, 'Whiteboard, Projector, Conference Phone, Video Conferencing', 1),
('Godavari', 6, 'Whiteboard, Projector, Conference Phone', 1),
('Indus', 6, 'Whiteboard, Projector, Conference Phone', 1),
('Ganges', 11, 'Whiteboard, Projector, Video Conferencing, Conference Phone, Air Conditioning', 1),
('Krishna', 8, 'Whiteboard, Projector, Conference Phone', 1),
('Periyar', 6, 'Whiteboard, Projector', 1),
('Yamuna', 4, 'Whiteboard, Projector', 1),
('Penna', 2, 'Whiteboard', 1),
('Kaveri', 5, 'Whiteboard, Projector', 1),
('Pamba', 2, 'Whiteboard', 1);