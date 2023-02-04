namespace OpenSpace.WebApi;

public static class OpenApi
{
    public static void AddOpenApi(this IServiceCollection services)
        => services.AddSwaggerGen(c =>
            c.CustomSchemaIds(t => t.IsNested
                ? t.FullName?.Replace(t.Namespace + ".", string.Empty)?.Replace("+", string.Empty)
                : t.Name));

    public static void UseOpenApi(this IApplicationBuilder app)
        => app.UseSwagger().UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Web API V1"));
}
