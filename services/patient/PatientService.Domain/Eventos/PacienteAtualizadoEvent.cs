namespace PatientService.Domain.Eventos;

public record PacienteAtualizadoEvent(
    Guid Id,
    string PrimeiroNome,
    string Sobrenome
) : IDomainEvent;
