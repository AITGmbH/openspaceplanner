using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using openspace.Tests.Fixtures;
using System;
using System.Collections.Generic;
using Xunit;
using Xunit.Abstractions;

namespace openspace.Tests
{
    public class TestBase : IClassFixture<DriverFixture>
    {
        protected IWebDriver Driver { get; }

        protected ITestOutputHelper TestOutput { get; }

        public TestBase(ITestOutputHelper testOutput, DriverFixture driverFixture)
        {
            TestOutput = testOutput;
            Driver = driverFixture.Driver;

            if (Driver == null)
            {
                testOutput.WriteLine("Test driver is NULL.");
            }
        }

        public void WaitUntil<T>(Func<T> callback, TimeSpan timeout = default(TimeSpan))
        {
            if (timeout == default(TimeSpan))
            {
                timeout = TimeSpan.FromSeconds(3);
            }

            var wait = new WebDriverWait(Driver, timeout);
            wait.Until(_ => callback());
        }

        protected IWebElement FindElement(By by) => Driver.FindElement(by, 200);

        protected IEnumerable<IWebElement> FindElements(By by) => Driver.FindElements(by, 200);
    }
}
