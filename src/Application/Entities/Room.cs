namespace OpenSpace.Application.Entities;

public record Room(
    string Id,
    string Name,
    int OrderNumber,
    int? Seats = null,
    ICollection<string>? Capabilities = null)
{
    public ICollection<string> Capabilities { get; init; } = Capabilities ?? new List<string>();
}
