namespace AppointmentService.Domain.Events;

public record ConsultaConfirmadaEvent(Guid IdConsulta, Guid IdPaciente, Guid IdMedico, DateTime AgendadoPara) : IDomainEvent;
