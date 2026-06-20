using System.Text.Json;
using MedicalRecordService.Domain.Entities;
using MedicalRecordService.Domain.Exceptions;

namespace MedicalRecordService.Domain.Events;

// Inverso do OutboxPublisher: lá serializamos evento.GetType().Name + JSON;
// aqui, dado o tipo_evento (string) e o payload (JSON), reconstruímos o record original para o replay.
public static class EventoArmazenadoSerializer
{
    private static readonly Dictionary<string, Type> Tipos = new()
    {
        [nameof(RecordCreatedEvent)] = typeof(RecordCreatedEvent),
        [nameof(ConsultationNoteAddedEvent)] = typeof(ConsultationNoteAddedEvent),
        [nameof(DiagnosisAddedEvent)] = typeof(DiagnosisAddedEvent),
        [nameof(PrescriptionAddedEvent)] = typeof(PrescriptionAddedEvent),
        [nameof(ExamRequestedEvent)] = typeof(ExamRequestedEvent),
    };

    public static IDomainEvent Desserializar(EventoArmazenado armazenado)
    {
        if (!Tipos.TryGetValue(armazenado.TipoEvento, out var tipo))
            throw new TipoEventoDesconhecidoException(armazenado.TipoEvento);

        return (IDomainEvent)JsonSerializer.Deserialize(armazenado.Payload, tipo)!;
    }
}
