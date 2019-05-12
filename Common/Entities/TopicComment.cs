namespace openspace.Common.Entities
{
    public class TopicComment
    {
        public string Id { get; set; } = System.Guid.NewGuid().ToString();

        public string Value { get; set; }
    }
}
