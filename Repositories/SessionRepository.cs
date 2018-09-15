using System.Collections.Generic;
using System.Threading.Tasks;
using openspace.Models;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using LogLevel = Microsoft.Extensions.Logging.LogLevel;
using System;
using Newtonsoft.Json;

namespace openspace.Repositories
{
    public class SessionRepository : SessionRepositoryBase
    {
        private bool _sessionsInitialized = false;
        private CloudBlobContainer _container;
        private readonly IConfiguration _configuration;

        public SessionRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            _sessions = new List<Session>();
        }

        public async Task InitializeAsync()
        {
            var storageAccount = new CloudStorageAccount(
                new Microsoft.WindowsAzure.Storage.Auth.StorageCredentials(
                _configuration["TableStorageAccount"],
                _configuration["TableStorageKey"]), true);

            var blobClient = storageAccount.CreateCloudBlobClient();
            _container = blobClient.GetContainerReference(_configuration["TableStorageContainer"]);
            await _container.CreateIfNotExistsAsync();

            if (!_sessionsInitialized)
            {
                _sessionsInitialized = true;

                var blockBlob = _container.GetBlockBlobReference("sessions");
                if (await blockBlob.ExistsAsync())
                {
                    _sessions = new List<Session>(JsonConvert.DeserializeObject<Session[]>(blockBlob.DownloadTextAsync().Result));
                }
            }
        }

        protected override void Save()
        {
            var blockBlob = _container.GetBlockBlobReference("sessions");
            blockBlob.UploadTextAsync(JsonConvert.SerializeObject(_sessions.ToArray()));
        }
    }
}
