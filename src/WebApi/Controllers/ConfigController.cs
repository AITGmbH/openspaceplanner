using Microsoft.AspNetCore.Mvc;
using OpenSpace.Application.Entities;

namespace OpenSpace.WebApi.Controllers;

public class ConfigController : ApiControllerBase
{
    private readonly IConfiguration _configuration;

    public ConfigController(IConfiguration configuration) => _configuration = configuration;

    [HttpGet]
    public Config GetConfigAsync() => new Config(_configuration["ApplicationInsights:InstrumentationKey"] ?? throw new InvalidOperationException("Could not find instrumentation key"));
}
