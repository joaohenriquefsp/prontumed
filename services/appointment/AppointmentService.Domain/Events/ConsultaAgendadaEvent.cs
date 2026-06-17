namespace AppointmentService.Domain.Events;
public record ConsultaAgendadaEvent(Guid IdConsulta, Guid IdPaciente, Guid IdMedico, DateTime AgendadoPara, int DuracaoMinutos) : IDomainEvent;
