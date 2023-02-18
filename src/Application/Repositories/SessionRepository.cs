using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;
using Newtonsoft.Json;
using OpenSpace.Application.Configurations;

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

        var blockBlob = _container.GetBlockBlobReference("sessions");
        LoadSessions(blockBlob.DownloadTextAsync().Result);
    }

    protected override void Save()
    {
        var blockBlob = _container.GetBlockBlobReference("sessions");
        blockBlob.UploadTextAsync(JsonConvert.SerializeObject(Sessions.ToArray()));
    }
}
