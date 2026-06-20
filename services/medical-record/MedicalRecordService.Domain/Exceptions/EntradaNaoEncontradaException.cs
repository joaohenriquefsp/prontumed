namespace MedicalRecordService.Domain.Exceptions;

public class EntradaNaoEncontradaException(Guid idEntrada)
    : Exception($"Entrada de prontuário '{idEntrada}' não encontrada.");
