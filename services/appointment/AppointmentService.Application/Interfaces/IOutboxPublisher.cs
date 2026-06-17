using AppointmentService.Domain;

namespace AppointmentService.Application.Interfaces;

public interface IOutboxPublisher
{
    Task PublicarEventosAsync(AggregateRoot agregado, CancellationToken ct = default);
}
