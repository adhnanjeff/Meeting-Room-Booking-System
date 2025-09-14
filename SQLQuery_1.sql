USE MeetingRoomDB;

CREATE TABLE AspNetRoles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(256) NOT NULL,
    NormalizedName NVARCHAR(256),
    ConcurrencyStamp NVARCHAR(MAX)
);

CREATE TABLE AspNetUsers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserName NVARCHAR(256),
    NormalizedUserName NVARCHAR(256),
    Email NVARCHAR(256),
    NormalizedEmail NVARCHAR(256),
    EmailConfirmed BIT NOT NULL,
    PasswordHash NVARCHAR(MAX),
    SecurityStamp NVARCHAR(MAX),
    ConcurrencyStamp NVARCHAR(MAX),
    PhoneNumber NVARCHAR(MAX),
    PhoneNumberConfirmed BIT NOT NULL,
    TwoFactorEnabled BIT NOT NULL,
    LockoutEnd DATETIMEOFFSET,
    LockoutEnabled BIT NOT NULL,
    AccessFailedCount INT NOT NULL,
    Department NVARCHAR(100) NOT NULL
);

CREATE TABLE AspNetUserRoles (
    UserId INT NOT NULL,
    RoleId INT NOT NULL,
    PRIMARY KEY(UserId, RoleId),
    FOREIGN KEY(UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY(RoleId) REFERENCES AspNetRoles(Id) ON DELETE CASCADE
);

CREATE TABLE MeetingRooms (
    RoomId INT IDENTITY(1,1) PRIMARY KEY,
    RoomName NVARCHAR(100) NOT NULL,
    Capacity INT NOT NULL,
    Amenities NVARCHAR(MAX) NOT NULL,
    IsAvailable BIT NOT NULL DEFAULT 1,
);

CREATE TABLE Bookings (
    BookingId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RoomId INT NOT NULL,
    OrganizerId INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    Status INT NOT NULL DEFAULT 0, -- Pending = 0
    IsEmergency BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME NULL,
    
    CONSTRAINT FK_Bookings_Room FOREIGN KEY (RoomId) REFERENCES MeetingRooms(RoomId) ON DELETE NO ACTION,
    CONSTRAINT FK_Bookings_Organizer FOREIGN KEY (OrganizerId) REFERENCES AspNetUsers(Id) ON DELETE NO ACTION
);

CREATE TABLE Attendees (
    AttendeeId INT IDENTITY(1,1) PRIMARY KEY,
    BookingId UNIQUEIDENTIFIER NOT NULL,
    UserId INT NOT NULL,
    Status INT NOT NULL DEFAULT 0, -- Pending = 0
    RoleInMeeting NVARCHAR(50) NOT NULL DEFAULT 'Participant',
    
    CONSTRAINT FK_Attendees_Booking FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE NO ACTION,
    CONSTRAINT FK_Attendees_User FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE NO ACTION
);


INSERT INTO MeetingRooms (RoomName, Capacity, Amenities, IsAvailable, PriorityLevel)
VALUES
('Conference Room A', 20, 'Projector, Whiteboard, Video Conferencing', 1, 1), -- High priority
('Meeting Room B', 10, 'Whiteboard, TV Screen', 1, 2),                       -- Medium priority
('Small Huddle Room', 4, 'Table, Chairs', 1, 3);                              -- Low priority

SELECT * FROM Bookings;
SELECT * FROM AspNetUsers;

DELETE FROM MeetingRooms; 
DELETE FROM Bookings;
DELETE FROM Attendees;

-- Execute fix_null_values.sql
UPDATE AspNetUsers SET Role = 1 WHERE Id = 2;
ALTER TABLE AspNetUsers ALTER COLUMN Role int NOT NULL;


ALTER TABLE [AspNetUsers] ADD [ManagerId] INT NULL;
ALTER TABLE [AspNetUsers] ADD [Preferences] NVARCHAR(MAX) NULL;
ALTER TABLE [AspNetUsers] ADD [Role] NVARCHAR(256) NULL;