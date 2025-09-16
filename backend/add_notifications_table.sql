-- Add Notifications table
CREATE TABLE [dbo].[Notifications] (
    [NotificationId] int IDENTITY(1,1) NOT NULL,
    [Title] nvarchar(200) NOT NULL,
    [Message] nvarchar(500) NOT NULL,
    [FromUser] nvarchar(100) NOT NULL DEFAULT(''),
    [UserId] int NOT NULL,
    [CreatedAt] datetime NOT NULL DEFAULT(getutcdate()),
    [IsRead] bit NOT NULL DEFAULT(0),
    CONSTRAINT [PK_Notifications] PRIMARY KEY ([NotificationId]),
    CONSTRAINT [FK_Notifications_Users] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX [IX_Notifications_UserId] ON [dbo].[Notifications] ([UserId]);
CREATE INDEX [IX_Notifications_IsRead] ON [dbo].[Notifications] ([IsRead]);