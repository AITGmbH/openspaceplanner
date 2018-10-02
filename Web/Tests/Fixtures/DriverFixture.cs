using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.IE;
using System;
using System.Drawing;
using System.Text;
using Xunit.Abstractions;
using Xunit.Sdk;

namespace openspace.Tests.Fixtures
{
    public class DriverFixture : IDisposable
    {
        public IWebDriver Driver { get; }

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

                    Driver = new FirefoxDriver(FirefoxDriverService.CreateDefaultService(Environment.CurrentDirectory),
                                new FirefoxOptions { Profile = profile },
                                TimeSpan.FromSeconds(30));
                }
                else if (testWebBrowser == "IE")
                {
                    Driver = new InternetExplorerDriver(Environment.CurrentDirectory);
                }
                else if (testWebBrowser == "Chrome")
                {
                    Driver = new ChromeDriver(Environment.CurrentDirectory);
                }

                Driver.Manage().Window.Position = new Point(0, 0);
                Driver.Manage().Window.Size = new Size(1920, 1080);

                Driver.Url = Environment.GetEnvironmentVariable("WebUrl") ?? "http://localhost:5000/";
                messageSink.OnMessage(new DiagnosticMessage($"WebUrl = {Driver?.Url ?? "NULL"}"));

                Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(10);
                Driver.Manage().Timeouts().AsynchronousJavaScript = TimeSpan.FromSeconds(10);
                Driver.Manage().Timeouts().PageLoad = TimeSpan.FromSeconds(10);

                Driver.FindElement(By.TagName("app-root"));
            }
            catch (Exception ex)
            {
                messageSink.OnMessage(new DiagnosticMessage($"Exception while initializing driver: {ex.Message}"));
                Driver?.Dispose();
            }
        }

        public void Dispose()
        {
            Driver?.Quit();
            Driver?.Dispose();
        }
    }
}
