namespace OpenSpace.Application.Services;

public interface ICalendarService
{
    Task<string> GetSessionsAsync();

    Task<string> GetSessionsAsync(params int[] ids);
}
