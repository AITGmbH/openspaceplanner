using System.Threading.Tasks;

namespace openspace.Services
{
    public interface ICalendarService
    {
        Task<string> GetSessionsAsync();

        Task<string> GetSessionsAsync(params int[] ids);
    }
}