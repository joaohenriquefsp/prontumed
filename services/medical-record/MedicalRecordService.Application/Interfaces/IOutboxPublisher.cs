using MedicalRecordService.Domain;

namespace MedicalRecordService.Application.Interfaces;

public interface IOutboxPublisher
{
    Task PublicarEventosAsync(AggregateRoot agregado, CancellationToken ct = default);
}
