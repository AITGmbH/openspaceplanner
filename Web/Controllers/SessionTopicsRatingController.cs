using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using openspace.Common.Entities;
using openspace.DataAccess.Repositories;
using openspace.Web.Hubs;
using System.Linq;
using System.Threading.Tasks;

namespace openspace.Web.Controllers
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
    }
}
