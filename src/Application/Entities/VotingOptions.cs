namespace OpenSpace.Application.Entities;

public record VotingOptions(
    DateTimeOffset? VotingStartDateTimeUtc = null,
    DateTimeOffset? VotingEndDateTimeUtc = null,
    int MaxVotesPerTopic = 1,
    int MaxNumberOfVotes = 5,
    bool BlindVotingEnabled = true,
    bool VotingEnabled = false);
