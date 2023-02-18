namespace OpenSpace.WebApi;

public static class Cors
{
    public static IApplicationBuilder UseCustomCors(this IApplicationBuilder app)
        => app.UseCors(builder =>
            builder
                .SetIsOriginAllowed((host) => true)
                .AllowCredentials()
                .AllowAnyMethod()
                .AllowAnyHeader());
}
