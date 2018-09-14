using System;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using openspace.Models;
using openspace.Repositories;

namespace openspace.Services
{
    public class TeamsService : ITeamsService
    {
        private readonly HttpClient _httpClient;
        private readonly string _urlFormat;

        public TeamsService(IHttpClientFactory clientFactory, string apiUrl, string urlFormat)
        {
            _httpClient = clientFactory.CreateClient();
            _httpClient.BaseAddress = new Uri(apiUrl);

            _urlFormat = urlFormat;
        }

        public async Task SendCardAsync(Session session, Topic oldTopic, Topic topic)
        {
            try
            {
                var changeText = GetChangeText(oldTopic, topic);
                if (changeText == null) return;

                var url = string.Format(_urlFormat, session.Id);

                var slot = session.Slots.FirstOrDefault(s => s.Id == topic.SlotId);
                var room = session.Rooms.FirstOrDefault(r => r.Id == topic.RoomId);

                if (slot == null || room == null) return;

                var body = $@"{{
                    ""@type"": ""MessageCard"",
                    ""@context"": ""https://schema.org/extensions"",
                    ""summary"": ""{session.Name}"",
                    ""themeColor"": ""0078D7"",
                    ""title"": ""{session.Name}"",
                    ""sections"": [
                        {{
                            ""facts"": [
                                {{
                                    ""name"": ""Topic:"",
                                    ""value"": ""{topic.Name}""
                                }},
                                {{
                                    ""name"": ""Slot:"",
                                    ""value"": ""{slot.Name} {(slot.Time != null ? "(" + slot.Time + ")" : string.Empty)}""
                                }},
                                {{
                                    ""name"": ""Room:"",
                                    ""value"": ""{room.Name}""
                                }}
                            ],
                            ""text"": ""{changeText}""
                        }}
                    ],
                    ""potentialAction"": [
                        {{
                            ""@type"": ""OpenUri"",
                            ""name"": ""View"",
                            ""targets"": [
                                {{
                                    ""os"": ""default"",
                                    ""uri"": ""{url}""
                                }}
                            ]
                        }}
                    ]
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
            if (oldTopic.SlotId != topic.SlotId && oldTopic.RoomId != topic.RoomId)
                return "The slot and room of the following topic changed.";
            else if (oldTopic.SlotId != topic.SlotId && oldTopic.RoomId == topic.RoomId)
                return "The slot of the following topic changed.";
            else if (oldTopic.SlotId == topic.SlotId && oldTopic.RoomId != topic.RoomId)
                return "The room of the following topic changed.";

            return null;
        }
    }
}
