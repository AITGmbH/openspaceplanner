using Website.UITests.Fixtures;
using Website.UITests.Models;
using Website.UITests.PageObjectModels;
using Xunit.Abstractions;

namespace Website.UITests.Tests;

public class SessionTests : TestBase
{
    public SessionTests(ITestOutputHelper testOutput, DriverFixture driverFixture)
        : base(testOutput, driverFixture)
    {
    }

    [Fact]
    [Trait("Category", "UITests")]
    public void CreateSession_ChangingDisplayName_ShouldDisplayNewName()
    {
        var session = new Session("BASTA 2018");

        var homePage = new HomePage(Driver);
        homePage.NavigateTo();

        var sessionPage = homePage.CreateSession();
        sessionPage.ChangeSession(session);

        sessionPage.Title.Should().Be(session.DisplayName);
    }
}
