using System;
using System.Linq;
using System.Threading.Tasks;
using openspace.Models;

namespace openspace.Services
{
    public interface ITeamsService
    {
        Task SendCardAsync(Session session, Topic oldTopic, Topic topic);
    }
}
