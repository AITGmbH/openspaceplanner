namespace OpenSpace.Application.Entities;

public record Session(
    int Id,
    string Name,
    string CreatedAt,
    ICollection<Room> Rooms,
    ICollection<Slot> Slots,
    ICollection<Topic> Topics,
    VotingOptions? VotingOptions,
    bool RatingEnabled = false,
    bool FreeForAll = false,
    bool AttendanceEnabled = true,
    bool TeamsAnnouncementsEnabled = false)
{
    public VotingOptions VotingOptions { get; init; } = VotingOptions ?? new VotingOptions();
}
