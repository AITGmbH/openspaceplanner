using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace openspace.Hubs
{
    public class SessionsHub : Hub<ISessionsHub>
    {
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            await Groups.AddToGroupAsync(Context.ConnectionId, Context.GetHttpContext().Request.Query["sessionId"].ToString());
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, Context.GetHttpContext().Request.Query["sessionId"].ToString());
        }
    }
}
