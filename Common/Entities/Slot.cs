using System;

namespace openspace.Common.Entities
{
    public class Slot
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string Name { get; set; }

        public string Time { get; set; }
    }
}