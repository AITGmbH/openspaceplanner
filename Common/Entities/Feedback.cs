using System.Collections.Generic;

namespace openspace.Common.Entities
{
    public class Feedback
    {
        public string Id { get; set; } = System.Guid.NewGuid().ToString();

        public ICollection<FeedbackItem> Items { get; set; } = new List<FeedbackItem>();
    }
}
