using System.Text;
using Microsoft.Extensions.Logging;
using OpenSpace.Application.Entities;

namespace OpenSpace.Application.Services;

public class TeamsService : ITeamsService
{
    private readonly string _apiUrl;
    private readonly IHttpClientFactory _clientFactory;
    private readonly ILogger<TeamsService> _logger;
    private readonly string _urlFormat;

    public TeamsService(IHttpClientFactory clientFactory, string apiUrl, string urlFormat, ILogger<TeamsService> logger)
    {
        _clientFactory = clientFactory;
        _apiUrl = apiUrl;
        _urlFormat = urlFormat;
        _logger = logger;
    }

    public async Task SendCardAsync(Session session, Topic oldTopic, Topic topic)
    {
        try
        {
            if (!session.TeamsAnnouncementsEnabled)
            {
                return;
            }

            var changeText = GetChangeText(oldTopic, topic);
            if (changeText is null)
            {
                return;
            }

            var url = string.Format(_urlFormat, session.Id);

            var slot = session.Slots.FirstOrDefault(s => s.Id == topic.SlotId);
            if (slot is null)
            {
                return;
            }

            var room = session.Rooms.FirstOrDefault(r => r.Id == topic.RoomId);
            if (room is null)
            {
                return;
            }

            var body = $@"{{
                    ""type"": ""AdaptiveCard"",
                    ""body"": [
                        {{
                            ""type"": ""Container"",
                            ""items"": [
                                {{
                                    ""type"": ""TextBlock"",
                                    ""size"": ""Medium"",
                                    ""weight"": ""Bolder"",
                                    ""text"": ""Open Space Planner: {session.Name}""
                                }}
                            ]
                        }},
                        {{
                            ""type"": ""Container"",
                            ""items"": [
                                {{
                                    ""type"": ""Container"",
                                    ""items"": [
                                        {{
                                            ""type"": ""TextBlock"",
                                            ""text"": ""{changeText}""
                                        }}
                                    ]
                                }},
                                {{
                                    ""type"": ""FactSet"",
                                    ""facts"": [
                                        {{
                                            ""title"": ""Topic:"",
                                            ""value"": ""{topic.Name}""
                                        }},
                                        {{
                                            ""title"": ""Slot:"",
                                            ""value"": ""{slot.Name}""
                                        }},
                                        {{
                                            ""title"": ""Room:"",
                                            ""value"": ""{room.Name}""
                                        }}
                                    ]
                                }}
                            ]
                        }}
                    ],
                    ""actions"": [
                        {{
                            ""type"": ""Action.OpenUrl"",
                            ""title"": ""View"",
                            ""url"": ""{url}""
                        }}
                    ],
                    ""version"": ""1.0""
                }}";

            using var httpClient = _clientFactory.CreateClient();
            httpClient.BaseAddress = new Uri(_apiUrl);

            using var stringContent = new StringContent(body, Encoding.UTF8, "application/json");
            await httpClient.PostAsync(string.Empty, stringContent);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not send teams message");
        }
    }

    private string? GetChangeText(Topic oldTopic, Topic topic)
    {
        if (oldTopic.RoomId == null || oldTopic.SlotId == null)
        {
            return null;
        }
        else if (oldTopic.SlotId != topic.SlotId && oldTopic.RoomId != topic.RoomId)
        {
            return "The slot and room of the following topic changed!";
        }
        else if (oldTopic.SlotId != topic.SlotId && oldTopic.RoomId == topic.RoomId)
        {
            return "The slot of the following topic changed!";
        }
        else if (oldTopic.SlotId == topic.SlotId && oldTopic.RoomId != topic.RoomId)
        {
            return "The room of the following topic changed!";
        }

        return null;
    }
}
