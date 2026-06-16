namespace PatientService.Domain.Exceptions;

public class CpfInvalidoException(string cpf)
    : Exception($"CPF '{cpf}' é inválido.");
