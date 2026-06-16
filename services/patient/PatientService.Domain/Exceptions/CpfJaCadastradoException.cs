namespace PatientService.Domain.Exceptions;

public class CpfJaCadastradoException(string cpf)
    : Exception($"CPF '{cpf}' já está cadastrado.");
