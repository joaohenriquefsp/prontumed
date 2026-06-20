namespace MedicalRecordService.Domain.Exceptions;

// Indica corrupção de dados no event store — não é um erro de cliente.
public class TipoEventoDesconhecidoException(string tipoEvento)
    : Exception($"Tipo de evento desconhecido no event store: '{tipoEvento}'.");
