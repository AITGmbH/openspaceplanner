using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;
using Newtonsoft.Json;
using openspace.Common.Entities;
using openspace.DataAccess.Configurations;
using System.Collections.Generic;
using System.Linq;

namespace openspace.DataAccess.Repositories
{
    public class SessionRepository : SessionRepositoryBase
    {
        private readonly CloudBlobContainer _container;

        public SessionRepository(BlobStorageConfiguration configuration)
        {
            var storageAccount = new CloudStorageAccount(
                new Microsoft.Azure.Storage.Auth.StorageCredentials(
                configuration.AccountName,
                configuration.Key), true);

            var blobClient = storageAccount.CreateCloudBlobClient();
            _container = blobClient.GetContainerReference(configuration.ContainerName);

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
