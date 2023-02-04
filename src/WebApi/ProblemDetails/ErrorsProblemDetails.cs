using System.ComponentModel.DataAnnotations;
using System.Net;
using Hellang.Middleware.ProblemDetails;
using OpenSpace.Application.Exceptions;

namespace OpenSpace.WebApi;

public class ErrorsProblemDetails : StatusCodeProblemDetails
{
    public ErrorsProblemDetails(InvalidInputException exception)
        : base((int)HttpStatusCode.BadRequest)
    {
        Detail = exception.Message;
        Errors = exception.Errors;
    }

    public IEnumerable<ValidationResult> Errors { get; set; }
}
