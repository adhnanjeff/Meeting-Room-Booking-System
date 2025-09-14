using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MeetingRoom.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovePriorityLevel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PriorityLevel",
                table: "MeetingRooms");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PriorityLevel",
                table: "MeetingRooms",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}