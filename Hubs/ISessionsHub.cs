using openspace.Models;
using System.Threading.Tasks;

namespace openspace.Hubs
{
    public interface ISessionsHub
    {
        Task DeleteRoom(string id);

        Task DeleteSlot(string id);

        Task DeleteTopic(string id);

        Task UpdateRoom(Room room);

        Task UpdateSession(Session session);

        Task UpdateSlot(Slot slot);

        Task UpdateTopic(Topic topic);
    }
}
