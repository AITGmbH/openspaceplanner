namespace openspace.Common.Entities
{
    public class FeedbackCategory
    {

        public string Id { get; set; } = System.Guid.NewGuid().ToString();

        public string Name { get; set; }

        public string Description { get; set; }

        public FeedbackCategoryType FeedbackCategoryType { get; set; }
    }
}
