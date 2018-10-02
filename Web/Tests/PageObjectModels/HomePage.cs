using OpenQA.Selenium;

namespace openspace.Tests.PageObjectModels
{
    public class HomePage : Page
    {
        private IWebElement CreateSessionButton => Driver.FindElement(By.Id("createSession"));

        public HomePage(IWebDriver driver) : base(driver)
        {
        }

        public void NavigateTo() => NavigateTo("/");

        public SessionPage CreateSession()
        {
            CreateSessionButton.Click();
            return new SessionPage(Driver);
        }
    }
}
