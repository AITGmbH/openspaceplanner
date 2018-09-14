using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using openspace.Hubs;
using openspace.Models;
using openspace.Repositories;
using openspace.Services;

namespace openspace.Controllers
{
    [Route("api/sessions/{sessionId:int}/topics")]
    public class SessionTopicsController : Controller
    {
        private readonly ISessionRepository _sessionRepository;
        private readonly ITeamsService _teamsService;
        private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

        public SessionTopicsController(ISessionRepository sessionRepository, ITeamsService teamsService,
            IHubContext<SessionsHub, ISessionsHub> sessionsHub)
        {
            _sessionRepository = sessionRepository;
            _teamsService = teamsService;
            _sessionsHub = sessionsHub;
        }

        [HttpPut("{topicId}")]
        public async Task<Topic> Put(int sessionId, string topicId, [FromBody] Topic topic)
        {
            if (topic == null)
            {
                return null;
            }

            var session = await _sessionRepository.Get(sessionId);
            var oldTopic = session.Topics.FirstOrDefault(t => t.Id == topicId);

            await _sessionRepository.Update(sessionId, (s) =>
            {
                var currentTopic = s.Topics.FirstOrDefault(t => t.Id == topicId);
                s.Topics.Remove(currentTopic);
                s.Topics.Add(topic);
            });

            await _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(topic);
            await _teamsService.SendCardAsync(session, oldTopic, topic);

            return topic;
        }

        [HttpPost("")]
        public async Task<Topic> Post(int sessionId, [FromBody] Topic topic)
        {
            await _sessionRepository.Update(sessionId, (session) =>
            {
                if (string.IsNullOrWhiteSpace(topic.Name))
                {
                    topic.Name = "Topic " + (session.Topics.Count + 1);
                }

                session.Topics.Add(topic);
            });

            await _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(topic);

            return topic;
        }

        [HttpDelete("{topicId}")]
        public async Task Delete(int sessionId, string topicId)
        {
            await _sessionRepository.Update(sessionId, (session) =>
            {
                var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId);
                session.Topics.Remove(currentTopic);
            });

            await _sessionsHub.Clients.Group(sessionId.ToString()).DeleteTopic(topicId);
        }
    }
}
