using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using openspace.Hubs;
using openspace.Models;
using openspace.Repositories;
using openspace.Services;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace openspace.Controllers
{
    [Route("api/sessions")]
    public class SessionsController : Controller
    {
        private readonly ISessionRepository _sessionRepository;
        private readonly ICalendarService _calendarService;
        private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

        public SessionsController(ISessionRepository sessionRepository, ICalendarService calendarService, IHubContext<SessionsHub, ISessionsHub> sessionsHub)
        {
            _sessionRepository = sessionRepository;
            _calendarService = calendarService;
            _sessionsHub = sessionsHub;
        }

        [HttpGet]
        public Task<IEnumerable<Session>> Get() => _sessionRepository.Get();

        [HttpGet("{id}")]
        public Task<Session> Get(int id) => _sessionRepository.Get(id);

        [HttpGet("{id}/calendar")]
        public async Task<IActionResult> GetSessionCalendar(int id)
        {
            var calendar = await _calendarService.GetSessionsAsync(id);

            Response.Headers["Content-Disposition"] = "attachment; filename=\"Session" + id + ".ics\"";
            return Content(calendar, "text/calendar");
        }

        [HttpGet("calendar")]
        public async Task<IActionResult> GetSessionsCalendar(int id)
        {
            var calendar = await _calendarService.GetSessionsAsync();

            Response.Headers["Content-Disposition"] = "attachment; filename=\"Sessions.ics\"";
            return Content(calendar, "text/calendar");
        }

        [HttpPost("")]
        public Task<Session> Post() => _sessionRepository.Create();

        [HttpPut("{id}")]
        public async Task<Session> Put(int id, [FromBody] Session session)
        {
            if (session == null)
            {
                return null;
            }

            await _sessionRepository.Update(session);
            await _sessionsHub.Clients.Group(id.ToString()).UpdateSession(session);

            return session;
        }

        [HttpDelete("{id}/attendances")]
        public Task ResetAttendances(int id)
        {
            return _sessionRepository.Update(id, session =>
            {
                foreach (var topic in session.Topics)
                {
                    topic.Attendees.Clear();
                    _sessionsHub.Clients.Group(id.ToString()).UpdateTopic(topic);
                }
            });
        }

        [HttpDelete("{id}/ratings")]
        public Task ResetRatings(int id)
        {
            return _sessionRepository.Update(id, session =>
            {
                foreach (var topic in session.Topics)
                {
                    topic.Ratings.Clear();
                    _sessionsHub.Clients.Group(id.ToString()).UpdateTopic(topic);
                }
            });
        }
    }
}
