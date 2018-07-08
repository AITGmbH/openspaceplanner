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

        [HttpPut("{roomId}")]
        public async Task<Room> Put(int sessionId, string roomId, [FromBody] Room room)
        {
            if (room == null)
            {
                return null;
            }

            await _sessionRepository.Update(sessionId, (session) =>
            {
                var currentRoom = session.Rooms.FirstOrDefault(r => r.Id == roomId);
                session.Rooms.Remove(currentRoom);
                session.Rooms.Add(room);
            });

            await _sessionsHub.Clients.Group(sessionId.ToString()).UpdateRoom(room);

            return room;
        }

        [HttpPost("")]
        public async Task<Room> Post(int sessionId, [FromBody] Room room)
        {
            await _sessionRepository.Update(sessionId, (session) =>
            {
                if (string.IsNullOrWhiteSpace(room.Name))
                {
                    room.Name = "Room " + (session.Rooms.Count + 1);
                }

                session.Rooms.Add(room);
            });

            await _sessionsHub.Clients.Group(sessionId.ToString()).UpdateRoom(room);

            return room;
        }

        [HttpDelete("{roomId}")]
        public async Task Delete(int sessionId, string roomId)
        {
            await _sessionRepository.Update(sessionId, (session) =>
            {
                var currentRoom = session.Rooms.FirstOrDefault(r => r.Id == roomId);
                session.Rooms.Remove(currentRoom);
            });

            await _sessionsHub.Clients.Group(sessionId.ToString()).DeleteRoom(roomId);
        }
    }
}
