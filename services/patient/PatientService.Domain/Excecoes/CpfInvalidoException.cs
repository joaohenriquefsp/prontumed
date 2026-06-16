namespace PatientService.Domain.Excecoes;

public class CpfInvalidoException(string cpf)
    : Exception($"CPF '{cpf}' é inválido.");
