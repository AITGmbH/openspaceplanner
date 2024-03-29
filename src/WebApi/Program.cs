using System.Diagnostics;
using System.Globalization;
using Serilog;
using Serilog.Events;
using Serilog.Exceptions;

namespace OpenSpace.WebApi;

public static class Program
{
    public static IHostBuilder CreateBuildWebHostBuilder(IConfiguration configuration, string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder
                => webBuilder
                    .CaptureStartupErrors(false)
                    .UseContentRoot(Directory.GetCurrentDirectory())
                    .UseConfiguration(configuration)
                    .UseStartup<Startup>())
            .UseSerilog();

    public static void Main(string[] args)
    {
        Activity.DefaultIdFormat = ActivityIdFormat.W3C;
        Activity.ForceDefaultIdFormat = true;

        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
#if DEBUG
            .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
#endif
            .AddEnvironmentVariables()
            .AddUserSecrets<Startup>()
            .Build();

        Log.Logger = new LoggerConfiguration()
            .Enrich.WithExceptionDetails()
            .ReadFrom.Configuration(configuration)
            .Enrich.FromLogContext()
            .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] [{SourceContext}] {Properties}{NewLine}{Message:lj}{NewLine}{Exception}", formatProvider: CultureInfo.InvariantCulture)
            .CreateLogger();

        try
        {
            Log.Debug("Starting up");
            CreateBuildWebHostBuilder(configuration, args).Build().Run();
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Application start-up failed");
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }
}
