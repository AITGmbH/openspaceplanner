namespace OpenSpace.WebApi;

public static class SinglePageApplication
{
    public static void UseSinglePageApplication(this IApplicationBuilder app)
    {
        app.Use(async (context, next) =>
            {
                var path = context.Request.Path.Value;
                if (path is not null && !path.StartsWith("/api") && !path.StartsWith("/hubs") && !Path.HasExtension(path))
                {
                    context.Request.Path = "/index.html";
                }

                await next();
            });

        app.UseStaticFiles(new StaticFileOptions()
        {
            OnPrepareResponse = (context) =>
            {
#if DEBUG
                context.Context.Response.Headers["Cache-Control"] = "no-cache, no-store";
                context.Context.Response.Headers["Pragma"] = "no-cache";
                context.Context.Response.Headers["Expires"] = "-1";
#endif
            },
        });
    }
}
