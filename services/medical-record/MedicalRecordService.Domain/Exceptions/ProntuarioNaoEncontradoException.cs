namespace MedicalRecordService.Domain.Exceptions;

public class ProntuarioNaoEncontradoException(Guid idPaciente)
    : Exception($"Prontuário do paciente '{idPaciente}' não encontrado.");
