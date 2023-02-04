namespace OpenSpace.Application.Entities;

public class Rating
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public decimal Value { get; set; }
}
