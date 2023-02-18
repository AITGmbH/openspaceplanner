using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OpenSpace.Application.Entities;
using OpenSpace.Application.Exceptions;
using OpenSpace.Application.Repositories;
using OpenSpace.WebApi.Hubs;

namespace OpenSpace.WebApi.Controllers;

[Route("api/sessions/{sessionId:int}/topics/{topicId}/attendances")]
public class SessionTopicsAttendanceController : Controller
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

    public SessionTopicsAttendanceController(ISessionRepository sessionRepository, IHubContext<SessionsHub, ISessionsHub> sessionsHub)
    {
        _sessionRepository = sessionRepository;
        _sessionsHub = sessionsHub;
    }

    [HttpDelete("{attendanceId}")]
    public async Task DeleteTopicAttendanceAsync(int sessionId, string topicId, string attendanceId)
        => await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId) ?? throw new EntityNotFoundException("Topic not found");

            if (session.FreeForAll && currentTopic.Attendees.Count > 0)
            {
                currentTopic.Attendees.Remove(currentTopic.Attendees.First());
            }
            else
            {
                var currentAttendance = currentTopic.Attendees.FirstOrDefault(r => r.Id == attendanceId) ?? throw new EntityNotFoundException("Attendance not found");
                currentTopic.Attendees.Remove(currentAttendance);
            }

            _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
        });

    [HttpPost]
    public async Task<Attendance[]> AddTopicAttendanceAsync(int sessionId, string topicId, [FromBody] Attendance[] attendances)
    {
        await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId) ?? throw new EntityNotFoundException("Topic not found");

            if (attendances.Length > 1 && session.FreeForAll)
            {
                currentTopic = currentTopic with { Attendees = new List<Attendance>(attendances) };
            }
            else
            {
                var attendance = attendances.First();
                if (attendance != null)
                {
                    currentTopic.Attendees.Add(attendance);
                }
            }

            _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
        });

        return attendances;
    }

    [HttpPut("{attendanceId}")]
    public async Task<Attendance> UpdateTopicAttendanceAsync(int sessionId, string topicId, string attendanceId, [FromBody] Attendance attendance)
    {
        await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId) ?? throw new EntityNotFoundException("Topic not found");
            var currentAttendance = currentTopic.Attendees.FirstOrDefault(r => r.Id == attendanceId);
            if (currentAttendance is not null)
            {
                currentTopic.Attendees.Remove(currentAttendance);
            }

            currentTopic.Attendees.Add(attendance);

            _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
        });

        return attendance;
    }
}
