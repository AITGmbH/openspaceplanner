using System.ComponentModel;

namespace OpenSpace.Application.Entities;

public record Slot(
    string Id,
    string Name,
    string? Time,
    [DefaultValue(true)]
    bool? IsPlanable = true);
