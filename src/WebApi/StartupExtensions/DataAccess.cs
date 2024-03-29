using OpenSpace.Application.Configurations;
using OpenSpace.Application.Repositories;

namespace OpenSpace.WebApi;

public static class DataAccess
{
    public static void AddDataAccess(this IServiceCollection services, IConfiguration configuration)
    {
        if (configuration["TableStorageAccount"] != null)
        {
            services.AddSingleton(
                new BlobStorageConfiguration(
                    configuration["TableStorageAccount"] ?? throw new InvalidOperationException("Could not find table storage account name"),
                    configuration["TableStorageKey"] ?? throw new InvalidOperationException("Could not find table storage key"),
                    configuration["TableStorageContainer"] ?? throw new InvalidOperationException("Could not find table storage container name")));

            services.AddSingleton<ISessionRepository, SessionRepository>();
        }
        else
        {
            services.AddSingleton<ISessionRepository, LocalSessionRepository>();
        }
    }
}
