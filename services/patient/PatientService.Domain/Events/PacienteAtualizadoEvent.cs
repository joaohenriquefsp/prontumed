namespace PatientService.Domain.Events;

public record PacienteAtualizadoEvent(
    Guid Id,
    string PrimeiroNome,
    string Sobrenome
) : IDomainEvent;
