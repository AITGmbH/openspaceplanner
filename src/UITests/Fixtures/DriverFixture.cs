using System.Drawing;
using System.Text;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Firefox;
using Xunit.Abstractions;
using Xunit.Sdk;

namespace Website.UITests.Fixtures;

public sealed class DriverFixture : IDisposable
{
    private readonly DriverService? _driverService;

    public DriverFixture(IMessageSink messageSink)
    {
        try
        {
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

            var testWebBrowser = Environment.GetEnvironmentVariable("TestWebBrowser") ?? "Chrome";
            messageSink.OnMessage(new DiagnosticMessage($"TestWebBrowser = {testWebBrowser}"));

            if (testWebBrowser == "Firefox")
            {
                var profiles = new FirefoxProfileManager();
                var profile = profiles.GetProfile("selenium");

                messageSink.OnMessage(new DiagnosticMessage("Profiles:"));
                foreach (var existingProfile in profiles.ExistingProfiles)
                {
                    messageSink.OnMessage(new DiagnosticMessage($"Profile = {existingProfile}"));
                }

                var options = new FirefoxOptions { Profile = profile };
                options.SetLoggingPreference(LogType.Browser, LogLevel.All);

                _driverService = FirefoxDriverService.CreateDefaultService(Environment.CurrentDirectory);
                Driver = new FirefoxDriver(
                    (FirefoxDriverService)_driverService,
                    new FirefoxOptions { Profile = profile },
                    TimeSpan.FromSeconds(30));
            }
            else
            {
                Driver = new ChromeDriver(Environment.CurrentDirectory);
            }

            Driver.Manage().Window.Position = new Point(0, 0);
            Driver.Manage().Window.Size = new Size(1920, 1080);

            Driver.Url = Environment.GetEnvironmentVariable("WebUrl") ?? "http://localhost:5000/";
            messageSink.OnMessage(new DiagnosticMessage($"WebUrl = {Driver.Url}"));

            Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(10);
            Driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(10);
            Driver.Manage().Timeouts().PageLoad = TimeSpan.FromSeconds(10);

            Driver.FindElement(By.TagName("app-root"));
        }
        catch (Exception ex)
        {
            messageSink.OnMessage(new DiagnosticMessage($"Exception while initializing driver: {ex.Message}"));
            throw;
        }
    }

    public IWebDriver Driver { get; }

    public void Dispose()
    {
        _driverService?.Dispose();

        Driver?.Quit();
        Driver?.Dispose();
    }
}
