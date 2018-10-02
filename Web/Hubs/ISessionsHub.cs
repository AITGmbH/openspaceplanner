using openspace.Common.Entities;
using System.Threading.Tasks;

namespace openspace.Web.Hubs
{
    public interface ISessionsHub
    {
        Task DeleteRoom(string id);

        Task DeleteSession();

        Task DeleteSlot(string id);

        Task DeleteTopic(string id);

        Task UpdateRoom(Room room);

        Task UpdateSession(Session session);

        Task UpdateSlot(Slot slot);

        Task UpdateTopic(Topic topic);
    }
}
