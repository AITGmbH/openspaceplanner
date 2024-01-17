using System.Xml.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OpenSpace.Application.Entities;
using OpenSpace.Application.Exceptions;
using OpenSpace.Application.Repositories;
using OpenSpace.Application.Services;
using OpenSpace.WebApi.Hubs;

namespace OpenSpace.WebApi.Controllers;

[Route("api/sessions/{sessionId:int}/topics")]
public class SessionTopicsController : ApiControllerBase
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;
    private readonly ITeamsService _teamsService;

    public SessionTopicsController(
        ISessionRepository sessionRepository,
        ITeamsService teamsService,
        IHubContext<SessionsHub, ISessionsHub> sessionsHub)
    {
        _sessionRepository = sessionRepository;
        _teamsService = teamsService;
        _sessionsHub = sessionsHub;
    }

    [HttpPost]
    public async Task<Topic> CreateTopicAsync(int sessionId, [FromBody] CreateTopicRequest request)
    {
        var session = await _sessionRepository.Get(sessionId);

        var topic = new Topic(
            Guid.NewGuid().ToString(),
            string.IsNullOrWhiteSpace(request.Name) ? "Topic " + (session.Topics.Count + 1) : request.Name,
            request.Description,
            request.Owner,
            Slots: request.Slots);

        await _sessionRepository.Update(sessionId, (session) => session.Topics.Add(topic));

        await _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(topic);

        return topic;
    }

    [HttpDelete("{topicId}")]
    public async Task DeleteTopicAsync(int sessionId, string topicId)
    {
        await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId) ?? throw new EntityNotFoundException("Topic not found");
            session.Topics.Remove(currentTopic);
        });

        await _sessionsHub.Clients.Group(sessionId.ToString()).DeleteTopic(topicId);
    }

    [HttpPut("{topicId}")]
    public async Task<Topic> UpdateTopicAsync(int sessionId, string topicId, [FromBody] Topic topic)
    {
        if ((string.IsNullOrWhiteSpace(topic.RoomId) && !string.IsNullOrWhiteSpace(topic.SlotId))
            || (!string.IsNullOrWhiteSpace(topic.RoomId) && string.IsNullOrWhiteSpace(topic.SlotId)))
        {
            throw new InvalidInputException("Room or slot is empty");
        }

        var session = await _sessionRepository.Get(sessionId);
        var oldTopic = session.Topics.FirstOrDefault(t => t.Id == topicId) ?? throw new EntityNotFoundException("Topic not found");

        await _sessionRepository.Update(sessionId, (s) =>
        {
            var currentTopic = s.Topics.FirstOrDefault(t => t.Id == topicId) ?? throw new EntityNotFoundException("Topic not found");
            s.Topics.Remove(currentTopic);
            s.Topics.Add(topic);
        });

        await _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(topic);
        await _teamsService.SendCardAsync(session, oldTopic, topic);

        return topic;
    }

    public record CreateTopicRequest(string? Name, string? Description, string? Owner, int Slots = 1);
}
