using System.Text.Json;

namespace OpenSpace.Application.Repositories;

public class LocalSessionRepository : SessionRepositoryBase
{
    private const string DatabaseFileName = "sessions.json";
    private readonly JsonSerializerOptions _serializerOptions = new()
    {
        AllowTrailingCommas = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DictionaryKeyPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    public LocalSessionRepository()
    {
        var sessionText = File.Exists(DatabaseFileName) ? File.ReadAllText(DatabaseFileName) : "[]";
        LoadSessions(sessionText);
    }

    protected override void Save() => File.WriteAllText(DatabaseFileName, JsonSerializer.Serialize(Sessions.ToArray(), _serializerOptions));
}
