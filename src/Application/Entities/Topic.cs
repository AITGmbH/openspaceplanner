namespace OpenSpace.Application.Entities;

public record Topic(
    string Id,
    string Name,
    string? Description = null,
    string? Owner = null,
    string? RoomId = null,
    string? SlotId = null,
    ICollection<Attendance>? Attendees = null,
    ICollection<string>? Demands = null,
    ICollection<Feedback>? Feedback = null,
    ICollection<Rating>? Ratings = null,
    ICollection<string>? Votes = null,
    int Slots = 1)
{
    public ICollection<Attendance> Attendees { get; init; } = Attendees ?? new List<Attendance>();

    public ICollection<string> Demands { get; init; } = Demands ?? new List<string>();

    public ICollection<Feedback> Feedback { get; init; } = Feedback ?? new List<Feedback>();

    public ICollection<Rating> Ratings { get; init; } = Ratings ?? new List<Rating>();

    public ICollection<string> Votes { get; init; } = Votes ?? new List<string>();
}
