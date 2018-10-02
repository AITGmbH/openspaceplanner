using OpenQA.Selenium;
using openspace.Tests.Models;

namespace openspace.Tests.PageObjectModels
{
    public class SessionPage : Page
    {
        public string Title => SessionTitleText.Text;

        private IWebElement EditButton => Driver.FindElement(By.ClassName("edit-button"));

        private IWebElement SessionNameInput => Driver.FindElement(By.CssSelector("app-session-modal #name"));

        private IWebElement SessionSaveButton => Driver.FindElement(By.CssSelector("app-session-modal #save"));

        private IWebElement SessionTitleText => Driver.FindElement(By.ClassName("title"));

        public SessionPage(IWebDriver driver) : base(driver)
        {
        }

        public void ChangeSession(Session session)
        {
            EditButton.Click();

            SessionNameInput.Clear();
            SessionNameInput.SendKeys(session.DisplayName);

            SessionSaveButton.Click();
        }

        public void NavigateTo() => NavigateTo("/");
    }
}
