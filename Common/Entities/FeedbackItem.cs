namespace openspace.Common.Entities
{
    public class FeedbackItem
    {
        public string Id { get; set; } = System.Guid.NewGuid().ToString();

        public string FeedbackCategoryId { get; set; }
    }
}
