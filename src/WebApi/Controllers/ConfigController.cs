using Microsoft.AspNetCore.Mvc;
using OpenSpace.Application.Entities;

namespace OpenSpace.WebApi.Controllers;

[Route("api/config")]
public class ConfigController : Controller
{
    private readonly IConfiguration _configuration;

    public ConfigController(IConfiguration configuration) => _configuration = configuration;

    [HttpGet]
    public Config GetConfigAsync() => new Config(_configuration["ApplicationInsights:InstrumentationKey"]);
}
