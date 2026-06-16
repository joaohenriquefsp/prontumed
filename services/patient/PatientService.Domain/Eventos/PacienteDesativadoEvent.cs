namespace PatientService.Domain.Eventos;

public record PacienteDesativadoEvent(Guid Id) : IDomainEvent;
