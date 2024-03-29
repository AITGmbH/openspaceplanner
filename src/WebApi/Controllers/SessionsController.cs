using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OpenSpace.Application.Entities;
using OpenSpace.Application.Repositories;
using OpenSpace.Application.Services;
using OpenSpace.WebApi.Hubs;

namespace OpenSpace.WebApi.Controllers;

public class SessionsController : ApiControllerBase
{
    private readonly ICalendarService _calendarService;
    private readonly ISessionRepository _sessionRepository;
    private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

    public SessionsController(ISessionRepository sessionRepository, ICalendarService calendarService, IHubContext<SessionsHub, ISessionsHub> sessionsHub)
    {
        _sessionRepository = sessionRepository;
        _calendarService = calendarService;
        _sessionsHub = sessionsHub;
    }

    [HttpPost]
    public Task<Session> CreateSessionAsync() => _sessionRepository.Create();

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSessionAsync(int id)
    {
        var success = await _sessionRepository.Delete(id);
        if (!success)
        {
            return NotFound();
        }

        await _sessionsHub.Clients.Group(id.ToString()).DeleteSession();
        return Ok();
    }

    [HttpDelete("{id}/attendances")]
    public Task DeleteSessionAttendancesAsync(int id)
        => _sessionRepository.Update(id, session =>
        {
            foreach (var topic in session.Topics)
            {
                topic.Attendees.Clear();
                _sessionsHub.Clients.Group(id.ToString()).UpdateTopic(topic);
            }
        });

    [HttpDelete("{id}/ratings")]
    public Task DeleteSessionRatingsAsync(int id)
        => _sessionRepository.Update(id, session =>
        {
            foreach (var topic in session.Topics)
            {
                topic.Ratings.Clear();
                _sessionsHub.Clients.Group(id.ToString()).UpdateTopic(topic);
            }
        });

    [HttpDelete("{id}/votes")]
    public Task DeleteSessionVotesAsync(int id)
        => _sessionRepository.Update(id, session =>
        {
            foreach (var topic in session.Topics)
            {
                topic.Votes.Clear();
                _sessionsHub.Clients.Group(id.ToString()).UpdateTopic(topic);
            }
        });

    [HttpGet("last")]
    public async Task<IEnumerable<Session>> GetLastSessionsAsync() => (await _sessionRepository.Get()).OrderByDescending(s => s.Id).Take(10);

    [HttpGet("{id}")]
    public Task<Session> GetSessionByIdAsync(int id) => _sessionRepository.Get(id);

    [HttpGet("{id}/calendar")]
    public async Task<IActionResult> GetSessionCalendarAsync(int id)
    {
        var calendar = await _calendarService.GetSessionsAsync(id);

        Response.Headers["Content-Disposition"] = "attachment; filename=\"Session" + id + ".ics\"";
        return Content(calendar, "text/calendar");
    }

    [HttpGet]
    public Task<IEnumerable<Session>> GetSessionsAsync() => _sessionRepository.Get();

    [HttpGet("calendar")]
    public async Task<IActionResult> GetSessionsCalendarAsync()
    {
        var calendar = await _calendarService.GetSessionsAsync();

        Response.Headers["Content-Disposition"] = "attachment; filename=\"Sessions.ics\"";
        return Content(calendar, "text/calendar");
    }

    [HttpPut("{id}")]
    public async Task<Session> UpdateSessionAsync(int id, [FromBody] Session session)
    {
        await _sessionRepository.Update(session);
        await _sessionsHub.Clients.Group(id.ToString()).UpdateSession(session);

        return session;
    }
}
