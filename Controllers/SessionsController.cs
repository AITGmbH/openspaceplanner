using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using openspace.Hubs;
using openspace.Models;
using openspace.Repositories;

namespace openspace.Controllers
{
    [Route("api/sessions")]
    public class SessionsController : Controller
    {
        private readonly ISessionRepository _sessionRepository;
        private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

        public SessionsController(ISessionRepository sessionRepository, IHubContext<SessionsHub, ISessionsHub> sessionsHub)
        {
            _sessionRepository = sessionRepository;
            _sessionsHub = sessionsHub;
        }

        [HttpGet]
        public Task<IEnumerable<Session>> Get() => _sessionRepository.Get();

        [HttpGet("{id}")]
        public Task<Session> Get(int id) => _sessionRepository.Get(id);

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
    }
}
