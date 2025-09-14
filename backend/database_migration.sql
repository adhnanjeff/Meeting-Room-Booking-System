-- Add new columns to AspNetUsers table
ALTER TABLE AspNetUsers ADD Role int NOT NULL DEFAULT 0;
ALTER TABLE AspNetUsers ADD ManagerId int NULL;
ALTER TABLE AspNetUsers ADD Preferences nvarchar(1000) NULL;

-- Add RequiresApproval column to Bookings table
ALTER TABLE Bookings ADD RequiresApproval bit NOT NULL DEFAULT 0;

-- Create BookingApprovals table
CREATE TABLE BookingApprovals (
    ApprovalId int IDENTITY(1,1) PRIMARY KEY,
    BookingId uniqueidentifier NOT NULL,
    RequesterId int NOT NULL,
    ApproverId int NULL,
    Status int NOT NULL,
    Comments nvarchar(500) NULL,
    RequestedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
    ApprovedAt datetime2 NULL,
    
    CONSTRAINT FK_BookingApprovals_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE,
    CONSTRAINT FK_BookingApprovals_Requester FOREIGN KEY (RequesterId) REFERENCES AspNetUsers(Id),
    CONSTRAINT FK_BookingApprovals_Approver FOREIGN KEY (ApproverId) REFERENCES AspNetUsers(Id)
);

-- Add manager hierarchy foreign key
ALTER TABLE AspNetUsers ADD CONSTRAINT FK_AspNetUsers_Manager FOREIGN KEY (ManagerId) REFERENCES AspNetUsers(Id);

-- Create indexes
CREATE INDEX IX_AspNetUsers_ManagerId ON AspNetUsers(ManagerId);
CREATE INDEX IX_BookingApprovals_BookingId ON BookingApprovals(BookingId);
CREATE INDEX IX_BookingApprovals_RequesterId ON BookingApprovals(RequesterId);
CREATE INDEX IX_BookingApprovals_ApproverId ON BookingApprovals(ApproverId);