using System.Xml.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OpenSpace.Application.Entities;
using OpenSpace.Application.Exceptions;
using OpenSpace.Application.Repositories;
using OpenSpace.WebApi.Hubs;

namespace OpenSpace.WebApi.Controllers;

[Route("api/sessions/{sessionId:int}/slots")]
public class SessionSlotsController : ApiControllerBase
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

    public SessionSlotsController(ISessionRepository sessionRepository, IHubContext<SessionsHub, ISessionsHub> sessionsHub)
    {
        _sessionRepository = sessionRepository;
        _sessionsHub = sessionsHub;
    }

    [HttpPost]
    public async Task<Slot> CreateSlotAsync(int sessionId, [FromBody] CreateSlotRequest request)
    {
        var session = await _sessionRepository.Get(sessionId);

        var highestOrderNumber = session.Slots.Count != 0 ? session.Slots.Max(s => s.OrderNumber) + 1 : 0;

        var slot = new Slot(
            Guid.NewGuid().ToString(),
            string.IsNullOrWhiteSpace(request.Name) ? "Slot " + (session.Slots.Count + 1) : request.Name,
            highestOrderNumber);

        await _sessionRepository.Update(sessionId, (session) => session.Slots.Add(slot));

        await _sessionsHub.Clients.Group(sessionId.ToString()).UpdateSlot(slot);

        return slot;
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

    public record CreateSlotRequest(string? Name);
}
