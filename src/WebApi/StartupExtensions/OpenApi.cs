using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace OpenSpace.WebApi;

public static class OpenApi
{
    public static void AddOpenApi(this IServiceCollection services)
        => services.AddSwaggerGen(c =>
        {
            c.SupportNonNullableReferenceTypes();

            c.CustomOperationIds(operationIdSelector =>
            {
                var controllerActionDescriptor = operationIdSelector.ActionDescriptor as ControllerActionDescriptor;
                return controllerActionDescriptor?.ActionName;
            });

            c.SchemaFilter<RequireNonNullablePropertiesSchemaFilter>();
        });

    public static void UseOpenApi(this IApplicationBuilder app)
        => app.UseSwagger().UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Web API V1"));

    public class OperationNameFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context) => operation.OperationId = context.MethodInfo.Name?.Replace("Async", string.Empty);
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
