using PatientService.Domain;

namespace PatientService.Application.Interfaces;

public interface IOutboxPublisher
{
    Task PublicarEventosAsync(AggregateRoot agregado, CancellationToken ct = default);
}
