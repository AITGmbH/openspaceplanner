using Newtonsoft.Json;
using OpenSpace.Application.Entities;

namespace OpenSpace.Application.Repositories;

public class LocalSessionRepository : SessionRepositoryBase
{
    private const string DatabaseFileName = "sessions.json";

    public LocalSessionRepository()
    {
        var database = File.Exists(DatabaseFileName) ? File.ReadAllText(DatabaseFileName) : "[]";
        Sessions = new List<Session>(JsonConvert.DeserializeObject<Session[]>(database));
    }

    protected override void Save() => File.WriteAllText(DatabaseFileName, JsonConvert.SerializeObject(Sessions.ToArray()));
}
