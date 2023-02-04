using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;
using Newtonsoft.Json;
using OpenSpace.Application.Configurations;
using OpenSpace.Application.Entities;

namespace OpenSpace.Application.Repositories;

public class SessionRepository : SessionRepositoryBase
{
    private readonly CloudBlobContainer _container;

    public SessionRepository(BlobStorageConfiguration configuration)
    {
        var storageAccount = new CloudStorageAccount(
            new Microsoft.Azure.Storage.Auth.StorageCredentials(
                configuration.AccountName,
                configuration.Key),
            true);

        var blobClient = storageAccount.CreateCloudBlobClient();
        _container = blobClient.GetContainerReference(configuration.ContainerName);

        if (Sessions == null)
        {
            var blockBlob = _container.GetBlockBlobReference("sessions");
            Sessions = new List<Session>(JsonConvert.DeserializeObject<Session[]>(blockBlob.DownloadTextAsync().Result));
        }
    }

    protected override void Save()
    {
        var blockBlob = _container.GetBlockBlobReference("sessions");
        blockBlob.UploadTextAsync(JsonConvert.SerializeObject(Sessions.ToArray()));
    }
}
