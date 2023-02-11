using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace OpenSpace.WebApi;

public static class OpenApi
{
    public static void AddOpenApi(this IServiceCollection services)
        => services.AddSwaggerGen(c =>
        {
            c.UseAllOfToExtendReferenceSchemas();

            c.SupportNonNullableReferenceTypes();

            c.OperationFilter<OperationNameFilter>();

            c.SchemaFilter<RequireNonNullablePropertiesSchemaFilter>();

            c.CustomSchemaIds(t => t.IsNested
                ? t.FullName?.Replace(t.Namespace + ".", string.Empty)?.Replace("+", string.Empty)
                : t.Name);
        });

    public static void UseOpenApi(this IApplicationBuilder app)
        => app.UseSwagger().UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Web API V1"));

    public class OperationNameFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            operation.OperationId = context.MethodInfo.Name?.Replace("Async", string.Empty);

            var contents = operation.Responses.Select(r => r.Value.Content);
            foreach (var content in contents)
            {
                content.Remove("text/json");
                content.Remove("text/plain");
            }
        }
    }

    public class RequireNonNullablePropertiesSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            var additionalRequiredProperties = schema.Properties
                .Where(x => !x.Value.Nullable && !schema.Required.Contains(x.Key))
                .Select(x => x.Key);

            foreach (var property in additionalRequiredProperties)
            {
                schema.Required.Add(property);
            }
        }
    }
}
