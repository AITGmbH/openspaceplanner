using OpenSpace.Application.Services;

namespace OpenSpace.WebApi;

public static class Teams
{
    public static void AddTeams(this IServiceCollection services, IConfiguration configuration)
    {
        var sessionUrlFormat = $"https://{Environment.GetEnvironmentVariable("WEBSITE_HOSTNAME")}/sessions/{{0}}";

        services.AddSingleton<ITeamsService>(provider =>
            new TeamsService(
                provider.GetRequiredService<IHttpClientFactory>(),
                configuration["TeamsWebhookUrl"],
                sessionUrlFormat,
                provider.GetRequiredService<ILogger<TeamsService>>()));
    }
}
