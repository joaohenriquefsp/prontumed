namespace MedicalRecordService.Domain.Exceptions;

public class TipoEntradaInvalidaException(string tipoEntrada)
    : Exception($"Tipo de entrada de prontuário inválido: '{tipoEntrada}'.");
