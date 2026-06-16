namespace PatientService.Domain.Events;

public record PacienteDesativadoEvent(Guid Id) : IDomainEvent;
