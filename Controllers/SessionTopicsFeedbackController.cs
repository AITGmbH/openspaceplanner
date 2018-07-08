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
    [Route("api/sessions/{sessionId:int}/topics/{topicId}/feedback")]
    public class SessionTopicsFeedbackController : Controller
    {
        private readonly ISessionRepository _sessionRepository;
        private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

        public SessionTopicsFeedbackController(ISessionRepository sessionRepository, IHubContext<SessionsHub, ISessionsHub> sessionsHub)
        {
            _sessionRepository = sessionRepository;
            _sessionsHub = sessionsHub;
        }

        [HttpPost]
        public async Task<Feedback> Post(int sessionId, string topicId, [FromBody] Feedback feedback)
        {
            if (feedback == null)
            {
                return null;
            }

            await _sessionRepository.Update(sessionId, (session) =>
            {
                var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId);
                currentTopic.Feedback.Add(feedback);

                _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
            });

            return feedback;
        }

        [HttpDelete("{feedbackId}")]
        public async Task Delete(int sessionId, string topicId, string feedbackId)
        {
            await _sessionRepository.Update(sessionId, (session) =>
            {
                var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId);
                var currentFeedback = currentTopic.Feedback.FirstOrDefault(r => r.Id == feedbackId);

                currentTopic.Feedback.Remove(currentFeedback);

                _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
            });
        }
    }
}
