using Newtonsoft.Json;
using OpenSpace.Application.Entities;
using OpenSpace.Application.Exceptions;

namespace OpenSpace.Application.Repositories;

public abstract class SessionRepositoryBase : ISessionRepository
{
    protected static ICollection<Session> Sessions { get; set; } = new List<Session>();

    public Task<Session> Create()
    {
        lock (Sessions)
        {
            var lastId = Sessions.Any() ? Sessions.Max(s => s.Id) : 1;
            var id = lastId + 1;
            var session = new Session(
                id,
                "Session #" + id,
                DateTime.Now.ToShortDateString(),
                new List<Room>(),
                new List<Slot>(),
                new List<Topic>());

            Sessions.Add(session);

            Save();

            return Task.FromResult(session);
        }
    }

    public Task<bool> Delete(int id)
    {
        lock (Sessions)
        {
            var session = Sessions.FirstOrDefault(s => s.Id == id) ?? throw new EntityNotFoundException("Session not found");

            Sessions.Remove(session);

            Save();
        }

        return Task.FromResult(true);
    }

    public Task<IEnumerable<Session>> Get() => Task.FromResult(Sessions.AsEnumerable());

    public Task<Session> Get(int id) => Task.FromResult(Sessions.FirstOrDefault(s => s.Id == id) ?? throw new EntityNotFoundException("Session not found"));

    public Task Update(int sessionId, Action<Session> func)
    {
        lock (Sessions)
        {
            var session = Sessions.FirstOrDefault(s => sessionId == s.Id) ?? throw new EntityNotFoundException("Session not found");

            func(session);

            Save();
        }

        return Task.CompletedTask;
    }

    public Task Update(Session session)
    {
        lock (Sessions)
        {
            var oldSession = Sessions.FirstOrDefault(s => session.Id == s.Id);
            if (oldSession != null)
            {
                Sessions.Remove(oldSession);
            }

            Sessions.Add(session);

            Save();
        }

        return Task.CompletedTask;
    }

    protected void LoadSessions(string sessionJson)
    {
        Sessions = new List<Session>(JsonConvert.DeserializeObject<Session[]>(
            sessionJson,
            new JsonSerializerSettings
            {
                DefaultValueHandling = DefaultValueHandling.Populate,
            }));
    }

    protected abstract void Save();
}
