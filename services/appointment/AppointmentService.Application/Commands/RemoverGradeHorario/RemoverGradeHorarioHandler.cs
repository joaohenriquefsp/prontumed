using MediatR;
using AppointmentService.Domain.Exceptions;
using AppointmentService.Domain.Repositories;

namespace AppointmentService.Application.Commands.RemoverGradeHorario;

public class RemoverGradeHorarioHandler(IGradeHorarioRepository repository)
    : IRequestHandler<RemoverGradeHorarioCommand>
{
    public async Task Handle(RemoverGradeHorarioCommand cmd, CancellationToken ct)
    {
        var grade = await repository.ObterPorIdAsync(cmd.Id, ct)
            ?? throw new GradeHorarioNaoEncontradaException();
        await repository.RemoverAsync(grade, ct);
    }
}
