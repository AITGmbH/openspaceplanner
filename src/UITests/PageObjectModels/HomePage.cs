using OpenQA.Selenium;

namespace Website.UITests.PageObjectModels;

public class HomePage : Page
{
    public HomePage(IWebDriver driver)
        : base(driver)
    {
    }

    private IWebElement CreateSessionButton => Driver.FindElement(By.Id("createSession"));

    public SessionPage CreateSession()
    {
        CreateSessionButton.Click();
        return new SessionPage(Driver);
    }

    public void NavigateTo() => NavigateTo("/");
}
