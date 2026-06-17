namespace AppointmentService.Domain.Events;
public record ConsultaNoShowEvent(Guid IdConsulta, Guid IdPaciente, Guid IdMedico, DateTime AgendadoPara) : IDomainEvent;
