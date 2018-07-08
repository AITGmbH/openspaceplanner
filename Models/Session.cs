using System;
using System.Collections.Generic;

namespace openspace.Models
{
    public class Session
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public ICollection<Topic> Topics { get; set; } = new List<Topic>();

        public ICollection<Room> Rooms { get; set; } = new List<Room>();

        public ICollection<Slot> Slots { get; set; } = new List<Slot>();

        public string CreatedAt { get; set; } = DateTime.Now.ToShortDateString();

        public bool FreeForAll { get; set; }

        public bool VotingEnabled { get; set; }

        public bool AttendanceEnabled { get; set; } = true;
    }
}