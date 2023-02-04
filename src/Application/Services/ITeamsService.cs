using OpenSpace.Application.Entities;

namespace OpenSpace.Application.Services;

public interface ITeamsService
{
    Task SendCardAsync(Session session, Topic oldTopic, Topic topic);
}
