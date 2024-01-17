using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OpenSpace.Application.Exceptions;
using OpenSpace.Application.Repositories;
using OpenSpace.WebApi.Hubs;

namespace OpenSpace.WebApi.Controllers;

[Route("api/sessions/{sessionId:int}/topics/{topicId}/votes")]
public class SessionTopicsVotesController : ApiControllerBase
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

    public SessionTopicsVotesController(ISessionRepository sessionRepository, IHubContext<SessionsHub, ISessionsHub> sessionsHub)
    {
        _sessionRepository = sessionRepository;
        _sessionsHub = sessionsHub;
    }

    [HttpPost("{voteId}")]
    public async Task CreateTopicVoteAsync(int sessionId, string topicId, string voteId)
        => await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId) ?? throw new EntityNotFoundException("Topic not found");

            currentTopic.Votes.Add(voteId);

            _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
        });

    [HttpDelete("{voteId}")]
    public async Task DeleteTopicVoteAsync(int sessionId, string topicId, string voteId)
        => await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId) ?? throw new EntityNotFoundException("Topic not found");

            var currentVote = currentTopic.Votes.FirstOrDefault(r => r == voteId) ?? throw new EntityNotFoundException("Vote not found");
            currentTopic.Votes.Remove(currentVote);

            _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
        });
}
