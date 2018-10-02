using FluentAssertions;
using openspace.Tests.Fixtures;
using openspace.Tests.Models;
using openspace.Tests.PageObjectModels;
using Xunit;
using Xunit.Abstractions;

namespace openspace.Tests
{
    public class SessionTests : TestBase
    {
        public SessionTests(ITestOutputHelper testOutput, DriverFixture driverFixture)
            : base(testOutput, driverFixture)
        {
        }

        [Fact, Trait("Category", "UITests")]
        public void CreateSession_ChangingDisplayName_ShouldDisplayNewName()
        {
            var session = new Session { DisplayName = "BASTA 2018" };

            var homePage = new HomePage(Driver);
            homePage.NavigateTo();

            var sessionPage = homePage.CreateSession();
            sessionPage.ChangeSession(session);

            sessionPage.Title.Should().Be(session.DisplayName);
        }
    }
}
