namespace openspace.Common.Entities
{
    public class Feedback
    {
        public string Id { get; set; } = System.Guid.NewGuid().ToString();

        public string Value { get; set; }
    }
}
