using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;

namespace openspace.Tests.PageObjectModels
{
    public abstract class Page
    {
        protected Uri Url => new Uri(Driver.Url);

        protected IWebDriver Driver { get; }

        protected Page(IWebDriver driver)
        {
            Driver = driver;
        }

        protected IWebElement FindElement(By by) => Driver.FindElement(by, 100);

        protected IEnumerable<IWebElement> FindElements(By by) => Driver.FindElements(by, 100);

        protected void NavigateTo(string path) => Driver.Navigate().GoToUrl(Url.GetLeftPart(UriPartial.Authority) + "/" + path);

        protected void WaitUntil<T>(Func<T> callback, TimeSpan timeout = default(TimeSpan))
        {
            if (timeout == default(TimeSpan))
            {
                timeout = TimeSpan.FromSeconds(3);
            }

            var wait = new WebDriverWait(Driver, timeout);
            wait.Until(_ => callback());
        }
    }
}
