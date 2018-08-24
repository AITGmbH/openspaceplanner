using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using openspace.Hubs;
using openspace.Models;
using openspace.Repositories;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace openspace.Controllers
{
    [Route("api/sessions")]
    public class SessionsController : Controller
    {
        private readonly ISessionRepository _sessionRepository;
        private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

        public SessionsController(ISessionRepository sessionRepository, IHubContext<SessionsHub, ISessionsHub> sessionsHub)
        {
            _sessionRepository = sessionRepository;
            _sessionsHub = sessionsHub;
        }

        [HttpGet]
        public Task<IEnumerable<Session>> Get() => _sessionRepository.Get();

        [HttpGet("{id}")]
        public Task<Session> Get(int id) => _sessionRepository.Get(id);

        [HttpGet("{id}/calendar")]
        public async Task<IActionResult> GetCalendar(int id)
        {
            var session = await _sessionRepository.Get(id);
            if (session == null) return NotFound();

            var dateMatch = Regex.Match(session.Name, "(\\d+\\.\\d+.\\d+)");
            if (dateMatch.Length == 0) return NotFound();
            if (!DateTime.TryParseExact(dateMatch.Groups[0].Value, "dd.MM.yyyy",
                    CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime date)) return NotFound();

            var sb = new StringBuilder();

            sb.AppendLine("BEGIN:VCALENDAR");
            sb.AppendLine("VERSION:2.0");
            sb.AppendLine("PRODID:openspace" + id);
            sb.AppendLine("CALSCALE:GREGORIAN");
            sb.AppendLine("METHOD:PUBLISH");

            sb.AppendLine("BEGIN:VTIMEZONE");
            sb.AppendLine("TZID:Europe/Berlin");
            sb.AppendLine("BEGIN:STANDARD");
            sb.AppendLine("TZOFFSETTO:+0100");
            sb.AppendLine("TZOFFSETFROM:+0100");
            sb.AppendLine("END:STANDARD");
            sb.AppendLine("END:VTIMEZONE");

            var topics = session.Topics.Where(t => t.RoomId != null && t.SlotId != null);
            foreach (var topic in session.Topics)
            {
                var slot = session.Slots.FirstOrDefault(s => s.Id == topic.SlotId);
                var room = session.Rooms.FirstOrDefault(r => r.Id == topic.RoomId);

                if (slot == null || room == null) continue;

                var slotTimes = Regex.Matches(slot.Time, "(\\d+\\:\\d+)");
                if (slotTimes.Count <= 1) continue;

                if (!TimeSpan.TryParse(slotTimes[0].Groups[0].Value, out TimeSpan startTime)) continue;
                if (!TimeSpan.TryParse(slotTimes[1].Groups[0].Value, out TimeSpan endTime)) continue;

                var startDateTime = new DateTime(date.Year, date.Month, date.Day, startTime.Hours, startTime.Minutes, 0).AddHours(-1);
                var endDateTime = new DateTime(date.Year, date.Month, date.Day, endTime.Hours, endTime.Minutes, 0).AddHours(-1);

                sb.AppendLine("BEGIN:VEVENT");

                sb.AppendLine("DTSTART;TZID=Europe/Berlin:" + startDateTime.ToString("yyyyMMddTHHmm00"));
                sb.AppendLine("DTEND;TZID=Europe/Berlin:" + endDateTime.ToString("yyyyMMddTHHmm00"));

                sb.AppendLine("SUMMARY:" + topic.Name + "");
                sb.AppendLine("LOCATION:" + room.Name + "");
                sb.AppendLine("DESCRIPTION:" + topic.Description ?? string.Empty + "");
                sb.AppendLine("BEGIN:VALARM");
                sb.AppendLine("TRIGGER:-PT15M");
                sb.AppendLine("ACTION:DISPLAY");
                sb.AppendLine("DESCRIPTION:Reminder");
                sb.AppendLine("END:VALARM");
                sb.AppendLine("END:VEVENT");
            }

            sb.AppendLine("END:VCALENDAR");

            Response.Headers["Content-Disposition"] = "attachment; filename=\"Session" + session.Id + ".ics\"";
            return Content(sb.ToString(), "text/calendar");
        }

        [HttpPost("")]
        public Task<Session> Post() => _sessionRepository.Create();

        [HttpPut("{id}")]
        public async Task<Session> Put(int id, [FromBody] Session session)
        {
            if (session == null)
            {
                return null;
            }

            await _sessionRepository.Update(session);
            await _sessionsHub.Clients.Group(id.ToString()).UpdateSession(session);

            return session;
        }

        [HttpDelete("{id}/attendances")]
        public Task ResetAttendances(int id)
        {
            return _sessionRepository.Update(id, session =>
            {
                foreach (var topic in session.Topics)
                {
                    topic.Attendees.Clear();
                    _sessionsHub.Clients.Group(id.ToString()).UpdateTopic(topic);
                }
            });
        }

        [HttpDelete("{id}/ratings")]
        public Task ResetRatings(int id)
        {
            return _sessionRepository.Update(id, session =>
            {
                foreach (var topic in session.Topics)
                {
                    topic.Ratings.Clear();
                    _sessionsHub.Clients.Group(id.ToString()).UpdateTopic(topic);
                }
            });
        }
    }
}
