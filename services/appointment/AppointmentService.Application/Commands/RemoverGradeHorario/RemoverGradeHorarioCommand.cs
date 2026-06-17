using MediatR;

namespace AppointmentService.Application.Commands.RemoverGradeHorario;

public record RemoverGradeHorarioCommand(Guid Id) : IRequest;
