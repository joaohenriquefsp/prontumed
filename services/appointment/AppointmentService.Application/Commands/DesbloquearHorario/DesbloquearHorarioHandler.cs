using MediatR;
using AppointmentService.Domain.Exceptions;
using AppointmentService.Domain.Repositories;

namespace AppointmentService.Application.Commands.DesbloquearHorario;

public class DesbloquearHorarioHandler(IHorarioBloqueadoRepository repository)
    : IRequestHandler<DesbloquearHorarioCommand>
{
    public async Task Handle(DesbloquearHorarioCommand cmd, CancellationToken ct)
    {
        var horario = await repository.ObterPorIdAsync(cmd.Id, ct)
            ?? throw new HorarioBloqueadoNaoEncontradoException();
        await repository.RemoverAsync(horario, ct);
    }
}
