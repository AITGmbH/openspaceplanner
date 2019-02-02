using System;
using System.Collections.Generic;

namespace openspace.Common.Entities
{
    public class Room
    {
        public ICollection<string> Capabilities { get; set; } = new List<string>();

        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string Name { get; set; }

        public int Seats { get; set; }
    }
}
