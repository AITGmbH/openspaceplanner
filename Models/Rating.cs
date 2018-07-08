namespace openspace.Models
{
    public class Rating
    {
        public string Id { get; set; } = System.Guid.NewGuid().ToString();

        public decimal Value { get; set; }
    }
}