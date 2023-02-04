using Microsoft.AspNetCore.SignalR;

namespace OpenSpace.WebApi.Hubs;

public class SessionsHub : Hub<ISessionsHub>
{
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();

        var httpContext = Context.GetHttpContext();
        if (httpContext is null)
        {
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, httpContext.Request.Query["sessionId"].ToString());
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);

        var httpContext = Context.GetHttpContext();
        if (httpContext is null)
        {
            return;
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, httpContext.Request.Query["sessionId"].ToString());
    }
}
