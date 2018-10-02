using openspace.Common.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace openspace.DataAccess.Repositories
{
    public abstract class SessionRepositoryBase : ISessionRepository
    {
        protected static ICollection<Session> _sessions;

        public Task<Session> Create()
        {
            lock (_sessions)
            {
                var lastId = _sessions.Any() ? _sessions.Max(s => s.Id) : 1;
                var session = new Session() { Id = lastId + 1 };
                session.Name = "Session #" + session.Id;
                _sessions.Add(session);

                Save();

                return Task.FromResult(session);
            }
        }

        public Task<bool> Delete(int id)
        {
            lock (_sessions)
            {
                var session = _sessions.FirstOrDefault(s => s.Id == id);
                if (session == null) return Task.FromResult(false);

                _sessions.Remove(session);

                Save();
            }

            return Task.FromResult(true);
        }

        public Task<IEnumerable<Session>> Get() => Task.FromResult(_sessions.AsEnumerable());

        public Task<Session> Get(int id) => Task.FromResult(_sessions.FirstOrDefault(s => s.Id == id));

        public Task Update(int sessionId, Action<Session> func)
        {
            lock (_sessions)
            {
                var session = _sessions.FirstOrDefault(s => sessionId == s.Id);
                func(session);

                Save();
            }

            return Task.FromResult(0);
        }

        public Task Update(Session session)
        {
            lock (_sessions)
            {
                var oldSession = _sessions.FirstOrDefault(s => session.Id == s.Id);
                if (oldSession != null)
                {
                    _sessions.Remove(oldSession);
                }

                _sessions.Add(session);

                Save();
            }

            return Task.FromResult(0);
        }

        protected abstract void Save();
    }
}
