using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OpenSpace.Application.Entities;
using OpenSpace.Application.Exceptions;
using OpenSpace.Application.Repositories;
using OpenSpace.WebApi.Hubs;

namespace OpenSpace.WebApi.Controllers;

[Route("api/sessions/{sessionId:int}/topics/{topicId}/feedback")]
public class SessionTopicsFeedbackController : ApiControllerBase
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

    public SessionTopicsFeedbackController(ISessionRepository sessionRepository, IHubContext<SessionsHub, ISessionsHub> sessionsHub)
    {
        _sessionRepository = sessionRepository;
        _sessionsHub = sessionsHub;
    }

    [HttpPost]
    public async Task<Feedback> CreateTopicFeedbackAsync(int sessionId, string topicId, [FromBody] CreateFeedbackRequest request)
    {
        var feedback = new Feedback(Guid.NewGuid().ToString(), request.Value);

        await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId) ?? throw new EntityNotFoundException("Topic not found");
            currentTopic.Feedback.Add(feedback);

            _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
        });

        return feedback;
    }

    [HttpDelete("{feedbackId}")]
    public async Task DeleteTopicFeedbackAsync(int sessionId, string topicId, string feedbackId)
        => await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId) ?? throw new EntityNotFoundException("Topic not found");
            var currentFeedback = currentTopic.Feedback.FirstOrDefault(r => r.Id == feedbackId) ?? throw new EntityNotFoundException("Feedback not found");

            currentTopic.Feedback.Remove(currentFeedback);

            _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
        });

    public record CreateFeedbackRequest(string Value);
}
