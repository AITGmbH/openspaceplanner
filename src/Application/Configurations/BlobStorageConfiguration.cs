namespace OpenSpace.Application.Configurations;

public class BlobStorageConfiguration
{
    public BlobStorageConfiguration(string accountName, string key, string containerName)
    {
        AccountName = accountName;
        Key = key;
        ContainerName = containerName;
    }

    public string AccountName { get; set; }

    public string ContainerName { get; set; }

    public string Key { get; set; }
}
