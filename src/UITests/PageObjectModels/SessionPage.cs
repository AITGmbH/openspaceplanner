using OpenQA.Selenium;
using Website.UITests.Models;

namespace Website.UITests.PageObjectModels;

public class SessionPage : Page
{
    public SessionPage(IWebDriver driver)
        : base(driver)
    {
    }

    public string Title => SessionTitleText.Text;

    private IWebElement EditButton => Driver.FindElement(By.ClassName("edit-button"));

    private IWebElement SessionNameInput => Driver.FindElement(By.CssSelector("app-session-modal #name"));

    private IWebElement SessionSaveButton => Driver.FindElement(By.CssSelector("app-session-modal #save"));

    private IWebElement SessionTitleText => Driver.FindElement(By.ClassName("title"));

    public void ChangeSession(Session session)
    {
        EditButton.Click();

        SessionNameInput.Clear();
        SessionNameInput.SendKeys(session.DisplayName);

        SessionSaveButton.Click();
    }

    public void NavigateTo() => NavigateTo("/");
}
