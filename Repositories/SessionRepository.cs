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
        private readonly CloudBlobContainer _container;

        public SessionRepository(IConfiguration configuration)
        {
            var storageAccount = new CloudStorageAccount(
                new Microsoft.WindowsAzure.Storage.Auth.StorageCredentials(
                configuration["TableStorageAccount"],
                configuration["TableStorageKey"]), true);

            var blobClient = storageAccount.CreateCloudBlobClient();
            _container = blobClient.GetContainerReference(configuration["TableStorageContainer"]);

            if (_sessions == null)
            {
                var blockBlob = _container.GetBlockBlobReference("sessions");
                _sessions = new List<Session>(JsonConvert.DeserializeObject<Session[]>(blockBlob.DownloadTextAsync().Result));
            }
        }

        protected override void Save()
        {
            var blockBlob = _container.GetBlockBlobReference("sessions");
            blockBlob.UploadTextAsync(JsonConvert.SerializeObject(_sessions.ToArray()));
        }
    }
}
