namespace PatientService.Domain.Excecoes;

public class CpfJaCadastradoException(string cpf)
    : Exception($"CPF '{cpf}' já está cadastrado.");
