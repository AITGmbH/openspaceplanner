using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OpenSpace.Application.Entities;
using OpenSpace.Application.Exceptions;
using OpenSpace.Application.Repositories;
using OpenSpace.WebApi.Hubs;

namespace OpenSpace.WebApi.Controllers;

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
    public async Task DeleteTopicRatingAsync(int sessionId, string topicId, string ratingId)
        => await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId) ?? throw new EntityNotFoundException("Topic not found");
            var currentRating = currentTopic.Ratings.FirstOrDefault(r => r.Id == ratingId) ?? throw new EntityNotFoundException("Rating not found");
            currentTopic.Ratings.Remove(currentRating);

            _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
        });

    [HttpPost]
    public async Task<Rating> AddTopicRatingAsync(int sessionId, string topicId, [FromBody] Rating rating)
    {
        rating = rating with { Id = Guid.NewGuid().ToString() };

        await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId) ?? throw new EntityNotFoundException("Topic not found");
            currentTopic.Ratings.Add(rating);

            _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
        });

        return rating;
    }

    [HttpPut("{ratingId}")]
    public async Task<Rating> UpdateTopicRatingAsync(int sessionId, string topicId, string ratingId, [FromBody] Rating rating)
    {
        await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId) ?? throw new EntityNotFoundException("Topic not found");
            var currentRating = currentTopic.Ratings.FirstOrDefault(r => r.Id == ratingId);
            if (currentRating is not null)
            {
                currentTopic.Ratings.Remove(currentRating);
            }

            currentTopic.Ratings.Add(rating);

            _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
        });

        return rating;
    }
}
