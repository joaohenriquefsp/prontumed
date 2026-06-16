using IdentityService.Domain;

namespace IdentityService.Application.Interfaces;

public interface IOutboxPublisher
{
    Task PublicarEventosAsync(AggregateRoot agregado, CancellationToken ct = default);
}
