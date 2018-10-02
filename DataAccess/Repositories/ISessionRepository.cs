using openspace.Common.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace openspace.DataAccess.Repositories
{
    public interface ISessionRepository
    {
        Task<Session> Create();

        Task<bool> Delete(int id);

        Task<IEnumerable<Session>> Get();

        Task<Session> Get(int id);

        Task Update(int sessionId, Action<Session> func);

        Task Update(Session session);
    }
}
