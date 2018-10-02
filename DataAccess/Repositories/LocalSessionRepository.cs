using Newtonsoft.Json;
using openspace.Common.Entities;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace openspace.DataAccess.Repositories
{
    public class LocalSessionRepository : SessionRepositoryBase
    {
        private const string DatabaseFileName = "sessions.json";

        public LocalSessionRepository()
        {
            if (_sessions == null)
            {
                var database = File.Exists(DatabaseFileName) ? File.ReadAllText(DatabaseFileName) : "[]";
                _sessions = new List<Session>(JsonConvert.DeserializeObject<Session[]>(database));
            }
        }

        protected override void Save()
        {
            File.WriteAllText(DatabaseFileName, JsonConvert.SerializeObject(_sessions.ToArray()));
        }
    }
}
