using System.Collections.Generic;
using System.Threading.Tasks;
using openspace.Models;
using System.Linq;
using LogLevel = Microsoft.Extensions.Logging.LogLevel;
using System;
using Newtonsoft.Json;
using System.IO;

namespace openspace.Repositories
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