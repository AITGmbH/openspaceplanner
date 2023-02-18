using System.Diagnostics;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace Website.UITests;

public static class WebDriverExtensions
{
    private static readonly List<string> ProcessesToCheck =
        new()
        {
            "opera",
            "chrome",
            "firefox",
            "ie",
            "gecko",
            "phantomjs",
            "edge",
            "microsoftwebdriver",
            "webdriver",
        };

    public static DateTime? TestRunStartTime { get; set; }

    public static IWebElement FindElement(this IWebDriver driver, By by, int timeoutInSeconds = 100)
    {
        if (timeoutInSeconds > 0)
        {
            var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeoutInSeconds));
            return wait.Until(drv => drv.FindElement(by));
        }

        return driver.FindElement(by);
    }

    public static IEnumerable<IWebElement> FindElements(this IWebDriver driver, By by, int timeoutInSeconds = 100)
    {
        if (timeoutInSeconds > 0)
        {
            var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeoutInSeconds));
            return wait.Until(drv => drv.FindElements(by));
        }

        return driver.FindElements(by);
    }

    public static void FinishHim(this IWebDriver driver)
    {
        foreach (var process in Process.GetProcesses())
        {
            try
            {
                Debug.WriteLine(process.ProcessName);

                if (process.StartTime > TestRunStartTime)
                {
                    var shouldKill = false;
                    foreach (var processName in ProcessesToCheck)
                    {
                        if (process.ProcessName.ToLower().Contains(processName))
                        {
                            shouldKill = true;
                            break;
                        }
                    }

                    if (shouldKill)
                    {
                        process.Kill();
                    }
                }
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
            }
        }
    }
}
