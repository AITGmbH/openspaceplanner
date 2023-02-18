using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OpenSpace.Application.Entities;
using OpenSpace.Application.Exceptions;
using OpenSpace.Application.Repositories;
using OpenSpace.WebApi.Hubs;

namespace OpenSpace.WebApi.Controllers;

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
    public async Task DeleteSlotAsync(int sessionId, string slotId)
    {
        await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentSlot = session.Slots.FirstOrDefault(s => s.Id == slotId) ?? throw new EntityNotFoundException("Slot not found");
            session.Slots.Remove(currentSlot);
        });

        await _sessionsHub.Clients.Group(sessionId.ToString()).DeleteSlot(slotId);
    }

    [HttpPost]
    public async Task<Slot> AddSlotAsync(int sessionId, [FromBody] Slot slot)
    {
        await _sessionRepository.Update(sessionId, (session) =>
        {
            slot = slot with
            {
                Id = Guid.NewGuid().ToString(),
                Name = string.IsNullOrWhiteSpace(slot.Name) ? "Slot " + (session.Slots.Count + 1) : slot.Name,
            };

            session.Slots.Add(slot);
        });

        await _sessionsHub.Clients.Group(sessionId.ToString()).UpdateSlot(slot);

        return slot;
    }

    [HttpPut("{slotId}")]
    public async Task<Slot> UpdateSlotAsync(int sessionId, string slotId, [FromBody] Slot slot)
    {
        await _sessionRepository.Update(sessionId, (session) =>
        {
            var currentSlot = session.Slots.FirstOrDefault(s => s.Id == slotId) ?? throw new EntityNotFoundException("Slot not found");
            session.Slots.Remove(currentSlot);
            session.Slots.Add(slot);
        });

        await _sessionsHub.Clients.Group(sessionId.ToString()).UpdateSlot(slot);

        return slot;
    }
}
