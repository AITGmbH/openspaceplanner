using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using openspace.Common.Entities;
using openspace.DataAccess.Repositories;
using openspace.Web.Hubs;
using System.Linq;
using System.Threading.Tasks;

namespace openspace.Web.Controllers
{
    [Route("api/sessions/{sessionId:int}/slots")]
    public class SessionSlotsController : Controller
    {
        private readonly ISessionRepository _sessionRepository;
        private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

        public SessionSlotsController(ISessionRepository sessionRepository, IHubContext<SessionsHub, ISessionsHub> sessionsHub)
        {
            _sessionRepository = sessionRepository;
            _sessionsHub = sessionsHub;
        }

        [HttpDelete("{slotId}")]
        public async Task Delete(int sessionId, string slotId)
        {
            await _sessionRepository.Update(sessionId, (session) =>
            {
                var currentSlot = session.Slots.FirstOrDefault(s => s.Id == slotId);
                session.Slots.Remove(currentSlot);
            });

            await _sessionsHub.Clients.Group(sessionId.ToString()).DeleteSlot(slotId);
        }

        [HttpPost("")]
        public async Task<Slot> Post(int sessionId, [FromBody] Slot slot)
        {
            await _sessionRepository.Update(sessionId, (session) =>
            {
                if (string.IsNullOrWhiteSpace(slot.Name))
                {
                    slot.Name = "Slot " + (session.Slots.Count + 1);
                }

                session.Slots.Add(slot);
            });

            await _sessionsHub.Clients.Group(sessionId.ToString()).UpdateSlot(slot);

            return slot;
        }

        [HttpPut("{slotId}")]
        public async Task<Slot> Put(int sessionId, string slotId, [FromBody] Slot slot)
        {
            if (slot == null)
            {
                return null;
            }

            await _sessionRepository.Update(sessionId, (session) =>
            {
                var currentSlot = session.Slots.FirstOrDefault(s => s.Id == slotId);
                session.Slots.Remove(currentSlot);
                session.Slots.Add(slot);
            }
            );

            await _sessionsHub.Clients.Group(sessionId.ToString()).UpdateSlot(slot);

            return slot;
        }
    }
}
