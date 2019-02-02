using openspace.Common.Entities;
using System;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace openspace.Domain.Services
{
    public class TeamsService : ITeamsService
    {
        private readonly HttpClient _httpClient;
        private readonly string _urlFormat;

        public TeamsService(IHttpClientFactory clientFactory, string apiUrl, string urlFormat)
        {
            _httpClient = clientFactory.CreateClient();

            if (!string.IsNullOrEmpty(apiUrl))
                _httpClient.BaseAddress = new Uri(apiUrl);

            _urlFormat = urlFormat;
        }

        public async Task SendCardAsync(Session session, Topic oldTopic, Topic topic)
        {
            try
            {
                if (!session.TeamsAnnouncementsEnabled) return;
                if (_httpClient.BaseAddress == null) return;

                var changeText = GetChangeText(oldTopic, topic);
                if (changeText == null) return;

                var url = string.Format(_urlFormat, session.Id);

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
                                            ""value"": ""{session.Slots.FirstOrDefault(s => s.Id == topic.SlotId).Name}""
                                        }},
                                        {{
                                            ""title"": ""Room:"",
                                            ""value"": ""{session.Rooms.FirstOrDefault(r => r.Id == topic.RoomId).Name}""
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

                await _httpClient.PostAsync("", new StringContent(body, Encoding.UTF8, "application/json"));
            }
            catch (Exception)
            {
                // ignore, maybe add logging later
            }
        }

        private string GetChangeText(Topic oldTopic, Topic topic)
        {
            if (oldTopic.RoomId == null || oldTopic.SlotId == null)
                return null;
            else if (oldTopic.SlotId != topic.SlotId && oldTopic.RoomId != topic.RoomId)
                return "The slot and room of the following topic changed!";
            else if (oldTopic.SlotId != topic.SlotId && oldTopic.RoomId == topic.RoomId)
                return "The slot of the following topic changed!";
            else if (oldTopic.SlotId == topic.SlotId && oldTopic.RoomId != topic.RoomId)
                return "The room of the following topic changed!";

            return null;
        }
    }
}
