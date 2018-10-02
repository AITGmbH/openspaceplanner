using System;

namespace openspace.Common.Entities
{
    public class Room
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string Name { get; set; }

        public int Seats { get; set; }
    }
}
