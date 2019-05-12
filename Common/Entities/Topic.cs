using System;
using System.Collections.Generic;

namespace openspace.Common.Entities
{
    public class Topic
    {
        public ICollection<Attendance> Attendees { get; set; } = new List<Attendance>();

        public ICollection<string> Demands { get; set; } = new List<string>();

        public string Description { get; set; }

        public ICollection<Feedback> Feedback { get; set; } = new List<Feedback>();

        public ICollection<TopicComment> Comments { get; set; } = new List<TopicComment>();

        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string Name { get; set; }

        public string Owner { get; set; }

        public ICollection<Rating> Ratings { get; set; } = new List<Rating>();

        public string RoomId { get; set; }

        public string SlotId { get; set; }
    }
}
