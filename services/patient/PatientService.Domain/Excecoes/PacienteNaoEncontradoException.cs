namespace PatientService.Domain.Excecoes;

public class PacienteNaoEncontradoException(string mensagem = "Paciente não encontrado.")
    : Exception(mensagem);
