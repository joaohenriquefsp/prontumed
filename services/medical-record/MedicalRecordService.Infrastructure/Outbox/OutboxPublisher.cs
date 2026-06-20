using System.Text.Json;
using MedicalRecordService.Application.Interfaces;
using MedicalRecordService.Domain;
using MedicalRecordService.Infrastructure.Persistence;

namespace MedicalRecordService.Infrastructure.Outbox;

public class OutboxPublisher(AppDbContext context) : IOutboxPublisher
{
    public async Task PublicarEventosAsync(AggregateRoot agregado, CancellationToken ct = default)
    {
        var idAgregado = (Guid)(agregado.GetType().GetProperty("Id")?.GetValue(agregado) ?? Guid.Empty);
        foreach (var evento in agregado.Eventos)
        {
            var eventoSaida = new EventoSaida
            {
                // Hardcoded — este serviço tem um único tipo de agregado e o conector Debezium
                // (route.by.field: tipo_agregado) exige exatamente a string "MedicalRecord".
                TipoAgregado = "MedicalRecord",
                IdAgregado = idAgregado,
                TipoEvento = evento.GetType().Name,
                Payload = JsonSerializer.Serialize(evento, evento.GetType())
            };
            await context.EventosSaida.AddAsync(eventoSaida, ct);
        }
        await context.SaveChangesAsync(ct);
    }
}
