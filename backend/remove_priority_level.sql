-- Remove PriorityLevel column from MeetingRooms table
ALTER TABLE MeetingRooms DROP COLUMN PriorityLevel;

-- Insert migration record
INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
VALUES ('20250111000000_RemovePriorityLevel', '8.0.0');