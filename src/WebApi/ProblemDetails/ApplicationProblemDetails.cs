using Hellang.Middleware.ProblemDetails;

namespace OpenSpace.WebApi;

public class ApplicationProblemDetails : StatusCodeProblemDetails
{
    public ApplicationProblemDetails(Exception exception, int statusCode)
        : base(statusCode) => Detail = exception.Message;
}
