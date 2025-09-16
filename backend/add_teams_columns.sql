-- Add Teams integration columns to Booking table
ALTER TABLE Bookings 
ADD TeamsEventId NVARCHAR(255) NULL,
    TeamsJoinUrl NVARCHAR(500) NULL;

-- Add Email column to Users table if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AspNetUsers' AND COLUMN_NAME = 'Email')
BEGIN
    ALTER TABLE AspNetUsers ADD Email NVARCHAR(256) NULL;
END

-- Update existing users with sample emails for testing
UPDATE AspNetUsers 
SET Email = LOWER(UserName) + '@company.com' 
WHERE Email IS NULL AND UserName IS NOT NULL;

PRINT 'Teams integration columns added successfully!';