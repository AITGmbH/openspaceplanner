using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using openspace.Common.Entities;
using openspace.DataAccess.Repositories;
using openspace.Web.Hubs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace openspace.Web.Controllers
{
    [Route("api/sessions/{sessionId:int}/topics/{topicId}/attendances")]
    public class SessionTopicsAttendanceController : Controller
    {
        private readonly ISessionRepository _sessionRepository;
        private readonly IHubContext<SessionsHub, ISessionsHub> _sessionsHub;

        public SessionTopicsAttendanceController(ISessionRepository sessionRepository, IHubContext<SessionsHub, ISessionsHub> sessionsHub)
        {
            _sessionRepository = sessionRepository;
            _sessionsHub = sessionsHub;
        }

        [HttpDelete("{attendanceId}")]
        public async Task Delete(int sessionId, string topicId, string attendanceId)
        {
            await _sessionRepository.Update(sessionId, (session) =>
            {
                var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId);
                var currentAttendance = currentTopic.Attendees.FirstOrDefault(r => r.Id == attendanceId);
                currentTopic.Attendees.Remove(currentAttendance);

                _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
            });
        }

        [HttpPost("")]
        public async Task<Attendance[]> Post(int sessionId, string topicId, [FromBody] Attendance[] attendances)
        {
            if (attendances == null)
            {
                return null;
            }

            await _sessionRepository.Update(sessionId, (session) =>
            {
                var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId);

                if (attendances.Length > 1 && session.FreeForAll)
                {
                    currentTopic.Attendees = new List<Attendance>(attendances);
                }
                else
                {
                    var attendance = attendances.First();
                    if (attendance != null)
                    {
                        currentTopic.Attendees.Add(attendance);
                    }
                }

                _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
            });

            return attendances;
        }

        [HttpPut("{attendanceId}")]
        public async Task<Attendance> Put(int sessionId, string topicId, string attendanceId, [FromBody] Attendance attendance)
        {
            if (attendance == null)
            {
                return null;
            }

            await _sessionRepository.Update(sessionId, (session) =>
            {
                var currentTopic = session.Topics.FirstOrDefault(t => t.Id == topicId);
                var currentAttendance = currentTopic.Attendees.FirstOrDefault(r => r.Id == attendance.Id);
                currentTopic.Attendees.Remove(currentAttendance);
                currentTopic.Attendees.Add(attendance);

                _sessionsHub.Clients.Group(sessionId.ToString()).UpdateTopic(currentTopic);
            });

            return attendance;
        }
    }
}
