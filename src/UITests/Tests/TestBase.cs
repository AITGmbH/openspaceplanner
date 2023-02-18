using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using Website.UITests.Fixtures;
using Xunit.Abstractions;

namespace Website.UITests.Tests;

public class TestBase : IClassFixture<DriverFixture>
{
    public TestBase(ITestOutputHelper testOutput, DriverFixture driverFixture)
    {
        TestOutput = testOutput;
        Driver = driverFixture.Driver;
    }

    protected IWebDriver Driver { get; }

    protected ITestOutputHelper TestOutput { get; }

    public void WaitUntil<T>(Func<T> callback, TimeSpan timeout = default)
    {
        if (timeout == default)
        {
            timeout = TimeSpan.FromSeconds(3);
        }

        var wait = new WebDriverWait(Driver, timeout);
        wait.Until(_ => callback());
    }

    protected IWebElement FindElement(By by) => Driver.FindElement(by, 200);

    protected IEnumerable<IWebElement> FindElements(By by) => Driver.FindElements(by, 200);
}
