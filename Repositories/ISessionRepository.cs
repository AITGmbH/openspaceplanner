using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using openspace.Models;

namespace openspace.Repositories
{
    public interface ISessionRepository
    {
        Task<IEnumerable<Session>> Get();

        Task<Session> Get(int id);

        Task<Session> Create();

        Task Update(int sessionId, Action<Session> func);

        Task Update(Session session);
    }
}