namespace OpenSpace.Application.Entities;

public record Session(
    int Id,
    string Name,
    string? CreatedAt,
    ICollection<Room>? Rooms,
    ICollection<Slot>? Slots,
    ICollection<Topic>? Topics,
    VotingOptions? VotingOptions,
    bool RatingEnabled = false,
    bool FreeForAll = false,
    bool AttendanceEnabled = true,
    bool TeamsAnnouncementsEnabled = false)
{
    public VotingOptions VotingOptions { get; init; } = VotingOptions ?? new VotingOptions();

    public string CreatedAt { get; init; } = CreatedAt ?? DateTimeOffset.UtcNow.ToString();

    public ICollection<Room> Rooms { get; init; } = Rooms ?? new List<Room>();

    public ICollection<Slot> Slots { get; init; } = Slots ?? new List<Slot>();

    public ICollection<Topic> Topics { get; init; } = Topics ?? new List<Topic>();
}
