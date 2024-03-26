using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OpenSpace.Application.Entities;
using OpenSpace.Application.Exceptions;
using OpenSpace.Application.Repositories;
using OpenSpace.WebApi.Hubs;

namespace OpenSpace.WebApi.Controllers;

[Route("api/sessions/{sessionId:int}/rooms")]
public class SessionRoomsController : ApiControllerBase
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

    public SessionRoomsController(ISessionRepository sessionRepository, IHubContext<SessionsHub, ISessionsHub> sessionsHub)
    {
        _sessionRepository = sessionRepository;
        _sessionsHub = sessionsHub;
    }

    [HttpPost]
    public async Task<Room> CreateRoomAsync(int sessionId, [FromBody] CreateRoomRequest request)
    {
        var session = await _sessionRepository.Get(sessionId);

        var highestOrderNumber = session.Rooms.Count != 0 ? session.Rooms.Max(r => r.OrderNumber) + 1 : 0;

        var room = new Room(
            Guid.NewGuid().ToString(),
            string.IsNullOrWhiteSpace(request.Name) ? "Room " + (session.Rooms.Count + 1) : request.Name,
            highestOrderNumber,
            request.Seats ?? 0,
            new List<string>());

        await _sessionRepository.Update(sessionId, (session) => session.Rooms.Add(room));

        await _sessionsHub.Clients.Group(sessionId.ToString()).UpdateRoom(room);

        return room;
    }

    [HttpDelete("{roomId}")]
    public async Task DeleteRoomAsync(int sessionId, string roomId)
    {
        await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentRoom = session.Rooms.FirstOrDefault(r => r.Id == roomId) ?? throw new EntityNotFoundException("Room not found");
            session.Rooms.Remove(currentRoom);
        });

        await _sessionsHub.Clients.Group(sessionId.ToString()).DeleteRoom(roomId);
    }

    [HttpPut("{roomId}")]
    public async Task<Room> UpdateRoomAsync(int sessionId, string roomId, [FromBody] Room room)
    {
        await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentRoom = session.Rooms.FirstOrDefault(r => r.Id == roomId) ?? throw new EntityNotFoundException("Room not found");
            session.Rooms.Remove(currentRoom);
            session.Rooms.Add(room);
        });

        await _sessionsHub.Clients.Group(sessionId.ToString()).UpdateRoom(room);

        return room;
    }

    public record CreateRoomRequest(string? Name, int? Seats);
}
