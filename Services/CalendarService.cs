using System;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using NodaTime;
using openspace.Repositories;

namespace openspace.Services
{
    public class CalendarService : ICalendarService
    {
        private readonly ISessionRepository _sessionRepository;
        private readonly DateTimeZone _timezone;

        public CalendarService(ISessionRepository sessionRepository, string timezone)
        {
            _sessionRepository = sessionRepository;
            _timezone = DateTimeZoneProviders.Tzdb[timezone];

        }

        public async Task<string> GetSessionsAsync()
        {
            var sessions = await _sessionRepository.Get();
            return await GetSessionsAsync(sessions.Select(s => s.Id).ToArray());
        }

        public async Task<string> GetSessionsAsync(params int[] ids)
        {
            var sb = new StringBuilder();

            sb.AppendLine("BEGIN:VCALENDAR");
            sb.AppendLine("VERSION:2.0");
            sb.AppendLine("PRODID:openspace" + (ids.Length > 1 ? string.Empty : ids.FirstOrDefault().ToString()));
            sb.AppendLine("CALSCALE:GREGORIAN");
            sb.AppendLine("METHOD:PUBLISH");

            foreach (var id in ids)
            {
                await BuildSessionAsync(sb, id);
            }

            sb.AppendLine("END:VCALENDAR");

            return sb.ToString();
        }

        private async Task<bool> BuildSessionAsync(StringBuilder sb, int id)
        {
            var session = await _sessionRepository.Get(id);
            if (session == null) return false;

            var dateMatch = Regex.Match(session.Name, "(\\d+\\.\\d+.\\d+)");
            if (dateMatch.Length == 0) return false;
            if (!DateTime.TryParseExact(dateMatch.Groups[0].Value, "dd.MM.yyyy",
                    CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime date)) return false;

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

                var startDateTime = new LocalDateTime(date.Year, date.Month, date.Day, startTime.Hours, startTime.Minutes, 0);
                var endDateTime = new LocalDateTime(date.Year, date.Month, date.Day, endTime.Hours, endTime.Minutes, 0);

                sb.AppendLine("BEGIN:VEVENT");

                sb.AppendLine("DTSTART:" + _timezone.AtStrictly(startDateTime).ToDateTimeUtc().ToString("yyyyMMddTHHmm00Z", null));
                sb.AppendLine("DTEND:" + _timezone.AtStrictly(endDateTime).ToDateTimeUtc().ToString("yyyyMMddTHHmm00Z", null));

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

            return true;
        }
    }
}