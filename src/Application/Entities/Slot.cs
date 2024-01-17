using System.ComponentModel;

namespace OpenSpace.Application.Entities;

public record Slot(
    string Id,
    string Name,
    string? Time = null,
    bool? IsPlanable = true);
