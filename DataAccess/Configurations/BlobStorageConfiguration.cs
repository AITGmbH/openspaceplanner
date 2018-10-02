namespace openspace.DataAccess.Configurations
{
    public class BlobStorageConfiguration
    {
        public string AccountName { get; set; }

        public string ContainerName { get; set; }

        public string Key { get; set; }

        public BlobStorageConfiguration(string accountName, string key, string containerName)
        {
            AccountName = accountName;
            Key = key;
            ContainerName = containerName;
        }
    }
}
