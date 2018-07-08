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
    [Route("api/sessions/{sessionId:int}/topics/{topicId}/ratings")]
    public class SessionTopicsRatingController : Controller
    {
        private readonly ISessionRepository _sessionRepository;
        private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

        public SessionTopicsRatingController(ISessionRepository sessionRepository, IHubContext<SessionsHub, ISessionsHub> sessionsHub)
        {
            _sessionRepository = sessionRepository;
            _sessionsHub = sessionsHub;
        }

        [HttpPut("{ratingId}")]
        public async Task<Rating> Put(int sessionId, string topicId, string ratingId, [FromBody] Rating rating)
        {
            if (rating == null)
            {
                return null;
            }

            await _sessionRepository.Update(sessionId, (session) =>
            {
                var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId);
                var currentRating = currentTopic.Ratings.FirstOrDefault(r => r.Id == rating.Id);
                currentTopic.Ratings.Remove(currentRating);
                currentTopic.Ratings.Add(rating);

                _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
            });

            return rating;
        }

        [HttpPost("")]
        public async Task<Rating> Post(int sessionId, string topicId, [FromBody] Rating rating)
        {
            if (rating == null)
            {
                return null;
            }

            await _sessionRepository.Update(sessionId, (session) =>
            {
                var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId);
                currentTopic.Ratings.Add(rating);

                _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
            });

            return rating;
        }

        [HttpDelete("{ratingId}")]
        public async Task Delete(int sessionId, string topicId, string ratingId)
        {
            await _sessionRepository.Update(sessionId, (session) =>
            {
                var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId);
                var currentRating = currentTopic.Ratings.FirstOrDefault(r => r.Id == ratingId);
                currentTopic.Ratings.Remove(currentRating);

                _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
            });
        }
    }
}
