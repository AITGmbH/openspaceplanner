using OpenSpace.Application.Repositories;
using OpenSpace.Application.Services;
using OpenSpace.WebApi.Hubs;

namespace OpenSpace.WebApi;

public class Startup
{
    public Startup(IConfiguration configuration) => Configuration = configuration;

    public IConfiguration Configuration { get; }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseHsts();
            app.UseHttpsRedirection();
        }

        app.UseProblemDetails();

        app.UseCustomCors();

        app.UseRouting();

        app.UseOpenApi();

        app.UseSinglePageApplication();

        app.UseEndpoints(c =>
        {
            c.MapControllers();
            c.MapHub<SessionsHub>("/hubs/sessions");
        });

        app.UseResponseCaching();

        app.UseResponseCompression();
    }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();

        services.AddCors();

        services.AddHttpClient();

        services.AddApplicationInsightsTelemetry();

        services.AddSignalR();

        services.AddResponseCaching();

        services.AddResponseCompression();

        services.AddOpenApi();

        services.AddProblemDetails();

        services.AddDataAccess(Configuration);

        services.AddTeams(Configuration);

        services.AddSingleton<ICalendarService>(provider
            => new CalendarService(provider.GetRequiredService<ISessionRepository>(), Configuration["Timezone"] ?? "Europe/Berlin"));
    }
}
