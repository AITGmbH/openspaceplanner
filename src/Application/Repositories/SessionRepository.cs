using System.Text.Json;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;
using OpenSpace.Application.Configurations;

namespace OpenSpace.Application.Repositories;

public class SessionRepository : SessionRepositoryBase
{
    private readonly CloudBlobContainer _container;
    private readonly JsonSerializerOptions _serializerOptions = new()
    {
        AllowTrailingCommas = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DictionaryKeyPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

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
        blockBlob.UploadTextAsync(JsonSerializer.Serialize(Sessions.ToArray(), _serializerOptions));
    }
}
