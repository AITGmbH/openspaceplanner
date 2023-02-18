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
                    configuration["TableStorageAccount"],
                    configuration["TableStorageKey"],
                    configuration["TableStorageContainer"]));

            services.AddSingleton<ISessionRepository, SessionRepository>();
        }
        else
        {
            services.AddSingleton<ISessionRepository, LocalSessionRepository>();
        }
    }
}
