using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace OpenQA.Selenium
{
    public static class WebDriverExtensions
    {
        private static readonly List<string> _processesToCheck =
            new List<string>
            {
            "opera",
            "chrome",
            "firefox",
            "ie",
            "gecko",
            "phantomjs",
            "edge",
            "microsoftwebdriver",
            "webdriver"
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
            driver?.Dispose();

            foreach (var process in Process.GetProcesses())
            {
                try
                {
                    Debug.WriteLine(process.ProcessName);

                    if (process.StartTime > TestRunStartTime)
                    {
                        var shouldKill = false;
                        foreach (var processName in _processesToCheck)
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
}
