namespace AppointmentService.Domain.Events;

public record ConsultaConcluidaEvent(Guid IdConsulta, Guid IdPaciente, Guid IdMedico, DateTime AgendadoPara) : IDomainEvent;
