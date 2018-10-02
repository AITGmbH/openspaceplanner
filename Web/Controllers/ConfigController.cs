using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using openspace.Common.Entities;

namespace openspace.Web.Controllers
{
    [Route("api/config")]
    public class ConfigController : Controller
    {
        private readonly IConfiguration _configuration;

        public ConfigController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public Config Get() => new Config
        {
            InstrumentationKey = _configuration["ApplicationInsights:InstrumentationKey"]
        };
    }
}
