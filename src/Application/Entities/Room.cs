namespace OpenSpace.Application.Entities;

public record Room(
    string Id,
    string Name,
    int? Seats,
    ICollection<string> Capabilities);
