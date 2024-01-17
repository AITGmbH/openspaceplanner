using Microsoft.AspNetCore.Mvc;

namespace OpenSpace.WebApi.Controllers;

[ApiController]
[ApiConventionType(typeof(DefaultApiConventions))]
[Route("api/[controller]/")]
[Consumes("application/json")]
[Produces("application/json")]
public abstract class ApiControllerBase : ControllerBase
{
}
