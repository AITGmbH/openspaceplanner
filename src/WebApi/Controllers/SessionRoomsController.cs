using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OpenSpace.Application.Entities;
using OpenSpace.Application.Exceptions;
using OpenSpace.Application.Repositories;
using OpenSpace.WebApi.Hubs;

namespace OpenSpace.WebApi.Controllers;

[Route("api/sessions/{sessionId:int}/rooms")]
public class SessionRoomsController : Controller
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

    public SessionRoomsController(ISessionRepository sessionRepository, IHubContext<SessionsHub, ISessionsHub> sessionsHub)
    {
        _sessionRepository = sessionRepository;
        _sessionsHub = sessionsHub;
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

    [HttpPost]
    public async Task<Room> AddRoomAsync(int sessionId, [FromBody] Room room)
    {
        await _sessionRepository.Update(sessionId, (session) =>
        {
            room = room with
            {
                Id = Guid.NewGuid().ToString(),
                Name = string.IsNullOrWhiteSpace(room.Name) ? "Room " + (session.Rooms.Count + 1) : room.Name,
                Seats = room.Seats ?? 0,
            };

            session.Rooms.Add(room);
        });

        await _sessionsHub.Clients.Group(sessionId.ToString()).UpdateRoom(room);

        return room;
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
}
