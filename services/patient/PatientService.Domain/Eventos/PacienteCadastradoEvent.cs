namespace PatientService.Domain.Eventos;

public record PacienteCadastradoEvent(
    Guid Id,
    string PrimeiroNome,
    string Sobrenome,
    string Cpf,
    DateOnly DataNascimento
) : IDomainEvent;
