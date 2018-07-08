using System;

namespace openspace.Models 
{    
    public class Room {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string Name { get; set; }

        public int Seats { get; set; }
    }
}