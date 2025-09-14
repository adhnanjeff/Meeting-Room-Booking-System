-- Update existing users to have default Role value (Employee = 0)
UPDATE AspNetUsers SET Role = 0 WHERE Role IS NULL;

-- Make Role column NOT NULL after setting defaults
ALTER TABLE AspNetUsers ALTER COLUMN Role int NOT NULL;