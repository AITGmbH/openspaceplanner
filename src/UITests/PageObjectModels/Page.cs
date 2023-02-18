using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace Website.UITests.PageObjectModels;

public abstract class Page
{
    protected Page(IWebDriver driver) => Driver = driver;

    protected IWebDriver Driver { get; }

    protected Uri Url => new Uri(Driver.Url);

    protected IWebElement FindElement(By by) => Driver.FindElement(by, 100);

    protected IEnumerable<IWebElement> FindElements(By by) => Driver.FindElements(by, 100);

    protected void NavigateTo(string path) => Driver.Navigate().GoToUrl(Url.GetLeftPart(UriPartial.Authority) + "/" + path);

    protected void WaitUntil<T>(Func<T> callback, TimeSpan timeout = default)
    {
        if (timeout == default)
        {
            timeout = TimeSpan.FromSeconds(3);
        }

        var wait = new WebDriverWait(Driver, timeout);
        wait.Until(_ => callback());
    }
}
