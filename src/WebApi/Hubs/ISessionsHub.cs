using OpenSpace.Application.Entities;

namespace OpenSpace.WebApi.Hubs;

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
