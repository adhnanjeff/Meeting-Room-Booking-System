-- Check if columns exist before adding them
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'Role')
    ALTER TABLE AspNetUsers ADD Role int NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'ManagerId')
    ALTER TABLE AspNetUsers ADD ManagerId int NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'Preferences')
    ALTER TABLE AspNetUsers ADD Preferences nvarchar(1000) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Bookings') AND name = 'RequiresApproval')
    ALTER TABLE Bookings ADD RequiresApproval bit NOT NULL DEFAULT 0;

-- Create BookingApprovals table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BookingApprovals')
BEGIN
    CREATE TABLE BookingApprovals (
        ApprovalId int IDENTITY(1,1) PRIMARY KEY,
        BookingId uniqueidentifier NOT NULL,
        RequesterId int NOT NULL,
        ApproverId int NULL,
        Status int NOT NULL,
        Comments nvarchar(500) NULL,
        RequestedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
        ApprovedAt datetime2 NULL
    );
END

-- Add foreign keys if they don't exist
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_BookingApprovals_Bookings')
    ALTER TABLE BookingApprovals ADD CONSTRAINT FK_BookingApprovals_Bookings 
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_BookingApprovals_Requester')
    ALTER TABLE BookingApprovals ADD CONSTRAINT FK_BookingApprovals_Requester 
    FOREIGN KEY (RequesterId) REFERENCES AspNetUsers(Id);

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_BookingApprovals_Approver')
    ALTER TABLE BookingApprovals ADD CONSTRAINT FK_BookingApprovals_Approver 
    FOREIGN KEY (ApproverId) REFERENCES AspNetUsers(Id);

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AspNetUsers_Manager')
    ALTER TABLE AspNetUsers ADD CONSTRAINT FK_AspNetUsers_Manager 
    FOREIGN KEY (ManagerId) REFERENCES AspNetUsers(Id);

-- Create indexes if they don't exist
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AspNetUsers_ManagerId')
    CREATE INDEX IX_AspNetUsers_ManagerId ON AspNetUsers(ManagerId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BookingApprovals_BookingId')
    CREATE INDEX IX_BookingApprovals_BookingId ON BookingApprovals(BookingId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BookingApprovals_RequesterId')
    CREATE INDEX IX_BookingApprovals_RequesterId ON BookingApprovals(RequesterId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BookingApprovals_ApproverId')
    CREATE INDEX IX_BookingApprovals_ApproverId ON BookingApprovals(ApproverId);