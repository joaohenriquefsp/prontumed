using System.Text.Json;
using AppointmentService.Application.Interfaces;
using AppointmentService.Domain;
using AppointmentService.Infrastructure.Persistence;

namespace AppointmentService.Infrastructure.Outbox;

public class OutboxPublisher(AppDbContext context) : IOutboxPublisher
{
    public async Task PublicarEventosAsync(AggregateRoot agregado, CancellationToken ct = default)
    {
        var idAgregado = (Guid)(agregado.GetType().GetProperty("Id")?.GetValue(agregado) ?? Guid.Empty);
        foreach (var evento in agregado.Eventos)
        {
            var eventoSaida = new EventoSaida
            {
                TipoAgregado = agregado.GetType().Name,
                IdAgregado = idAgregado,
                TipoEvento = evento.GetType().Name,
                Payload = JsonSerializer.Serialize(evento, evento.GetType())
            };
            await context.EventosSaida.AddAsync(eventoSaida, ct);
        }
        await context.SaveChangesAsync(ct);
    }
}
