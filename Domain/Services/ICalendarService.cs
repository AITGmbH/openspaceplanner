using System.Threading.Tasks;

namespace openspace.Domain.Services
{
    public interface ICalendarService
    {
        Task<string> GetSessionsAsync();

        Task<string> GetSessionsAsync(params int[] ids);
    }
}