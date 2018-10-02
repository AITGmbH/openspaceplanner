using openspace.Common.Entities;
using System.Threading.Tasks;

namespace openspace.Domain.Services
{
    public interface ITeamsService
    {
        Task SendCardAsync(Session session, Topic oldTopic, Topic topic);
    }
}
