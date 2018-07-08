namespace openspace.Models
{
    public class Attendance
    {
        public string Id { get; set; } = System.Guid.NewGuid().ToString();

        public bool Value { get; set; }
    }
}