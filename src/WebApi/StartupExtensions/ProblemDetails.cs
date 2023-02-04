using Hellang.Middleware.ProblemDetails;
using OpenSpace.Application.Exceptions;

namespace OpenSpace.WebApi;

public static class ProblemDetails
{
    public static void AddProblemDetails(this IServiceCollection services)
        => services.AddProblemDetails(options =>
        {
            options.Map<EntityNotFoundException>(ex => new ApplicationProblemDetails(ex, StatusCodes.Status404NotFound));
            options.Map<InvalidInputException>(ex => new ErrorsProblemDetails(ex));
            options.Map<Exception>(ex => new ApplicationProblemDetails(ex, StatusCodes.Status500InternalServerError));
        });

    public static void UseProblemDetails(this IApplicationBuilder app)
        => ProblemDetailsExtensions.UseProblemDetails(app);
}
