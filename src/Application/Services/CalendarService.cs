using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using NodaTime;
using OpenSpace.Application.Repositories;

namespace OpenSpace.Application.Services;

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
        sb.AppendLine("PRODID:OpenSpace" + (ids.Length > 1 ? string.Empty : ids.FirstOrDefault().ToString()));
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
        if (session == null)
        {
            return false;
        }

        var dateMatch = Regex.Match(session.Name, "(\\d+\\.\\d+.\\d+)");
        if (dateMatch.Length == 0)
        {
            return false;
        }

        var dateTimeMatches = DateTime.TryParseExact(
            dateMatch.Groups[0].Value,
            "dd.MM.yyyy",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var date);

        if (!dateTimeMatches)
        {
            return false;
        }

        var topics = session.Topics.Where(t => t.RoomId is not null && t.SlotId is not null);
        foreach (var topic in topics)
        {
            var slot = session.Slots.FirstOrDefault(s => s.Id == topic.SlotId);
            var room = session.Rooms.FirstOrDefault(r => r.Id == topic.RoomId);

            if (slot is null || room is null)
            {
                continue;
            }

            var slotTimes = Regex.Matches(slot.Time ?? string.Empty, "(\\d+\\:\\d+)");
            if (slotTimes.Count <= 1)
            {
                continue;
            }

            if (!TimeSpan.TryParse(slotTimes[0].Groups[0].Value, out var startTime))
            {
                continue;
            }

            if (!TimeSpan.TryParse(slotTimes[1].Groups[0].Value, out var endTime))
            {
                continue;
            }

            var startDateTime = new LocalDateTime(date.Year, date.Month, date.Day, startTime.Hours, startTime.Minutes, 0);
            var endDateTime = new LocalDateTime(date.Year, date.Month, date.Day, endTime.Hours, endTime.Minutes, 0);

            sb.AppendLine("BEGIN:VEVENT");

            sb.AppendLine("DTSTART:" + _timezone.AtStrictly(startDateTime).ToDateTimeUtc().ToString("yyyyMMddTHHmm00Z", null));
            sb.AppendLine("DTEND:" + _timezone.AtStrictly(endDateTime).ToDateTimeUtc().ToString("yyyyMMddTHHmm00Z", null));

            sb.AppendLine("SUMMARY:" + topic.Name + string.Empty);
            sb.AppendLine("LOCATION:" + room.Name + string.Empty);
            sb.AppendLine("DESCRIPTION:" + topic.Description ?? string.Empty + string.Empty);
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
