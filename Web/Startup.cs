using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using openspace.DataAccess.Configurations;
using openspace.DataAccess.Repositories;
using openspace.Domain.Services;
using openspace.Web.Hubs;
using System;
using System.IO;
using System.Net.Http;

namespace openspace
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

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

            app.Use(async (context, next) =>
            {
                var path = context.Request.Path.Value;
                if (!path.StartsWith("/api") && !path.StartsWith("/hubs") && !Path.HasExtension(path))
                {
                    context.Request.Path = "/index.html";
                }

                await next();
            });

            app.UseRouting();
            app.UseStaticFiles(new StaticFileOptions()
            {
                OnPrepareResponse = (context) =>
                {
#if DEBUG
                    context.Context.Response.Headers["Cache-Control"] = "no-cache, no-store";
                    context.Context.Response.Headers["Pragma"] = "no-cache";
                    context.Context.Response.Headers["Expires"] = "-1";
#endif
                }
            });
            app.UseCookiePolicy();

            app.UseEndpoints(c =>
            {
                c.MapControllers();
                c.MapHub<SessionsHub>("/hubs/sessions");
            });
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            services.AddControllers();

            services.AddApplicationInsightsTelemetry();
            services.AddHttpClient();
            services.AddSignalR();

            if (Configuration["TableStorageAccount"] != null)
            {
                services.AddSingleton(new BlobStorageConfiguration(Configuration["TableStorageAccount"],
                    Configuration["TableStorageKey"], Configuration["TableStorageContainer"]));

                services.AddSingleton<ISessionRepository, SessionRepository>();
            }
            else
            {
                services.AddSingleton<ISessionRepository, LocalSessionRepository>();
            }

            var sessionUrlFormat = $"https://{Environment.GetEnvironmentVariable("WEBSITE_HOSTNAME")}/sessions/{{0}}";

            services.AddSingleton<ITeamsService>(provider =>
                new TeamsService(provider.GetService<IHttpClientFactory>(), Configuration["TeamsWebhookUrl"], sessionUrlFormat));

            services.AddSingleton<ICalendarService>(provider
                => new CalendarService(provider.GetService<ISessionRepository>(), Configuration["Timezone"] ?? "Europe/Berlin"));
        }
    }
}
