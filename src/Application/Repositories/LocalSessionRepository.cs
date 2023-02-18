using Newtonsoft.Json;

namespace OpenSpace.Application.Repositories;

public class LocalSessionRepository : SessionRepositoryBase
{
    private const string DatabaseFileName = "sessions.json";

    public LocalSessionRepository()
    {
        var sessionText = File.Exists(DatabaseFileName) ? File.ReadAllText(DatabaseFileName) : "[]";
        LoadSessions(sessionText);
    }

    protected override void Save() => File.WriteAllText(DatabaseFileName, JsonConvert.SerializeObject(Sessions.ToArray()));
}
