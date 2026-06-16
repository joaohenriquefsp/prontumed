namespace PatientService.Domain.Exceptions;

public class PacienteNaoEncontradoException(string mensagem = "Paciente não encontrado.")
    : Exception(mensagem);
