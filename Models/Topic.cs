using System;
using System.Collections.Generic;

namespace openspace.Models
{
    public class Topic
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string Name { get; set; }

        public string Description { get; set; }

        public string Owner { get; set; }

        public ICollection<Feedback> Feedback { get; set; } = new List<Feedback>();

        public ICollection<Attendance> Attendees { get; set; } = new List<Attendance>();

        public ICollection<Rating> Ratings { get; set; } = new List<Rating>();

        public string RoomId { get; set; }

        public string SlotId { get; set; }
    }
}