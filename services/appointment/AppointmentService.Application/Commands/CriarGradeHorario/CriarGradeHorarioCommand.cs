using MediatR;

namespace AppointmentService.Application.Commands.CriarGradeHorario;

public record CriarGradeHorarioCommand(
    Guid IdMedico,
    int DiaSemana,
    TimeOnly HorarioInicio,
    TimeOnly HorarioFim,
    int DuracaoSlotMinutos) : IRequest<Guid>;
