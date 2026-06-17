using MediatR;
using AppointmentService.Domain.Entities;
using AppointmentService.Domain.Repositories;

namespace AppointmentService.Application.Commands.BloquearHorario;

public class BloquearHorarioHandler(IHorarioBloqueadoRepository repository)
    : IRequestHandler<BloquearHorarioCommand, Guid>
{
    public async Task<Guid> Handle(BloquearHorarioCommand cmd, CancellationToken ct)
    {
        var horario = HorarioBloqueado.Criar(cmd.IdMedico, cmd.InicioEm, cmd.FimEm, cmd.Motivo);
        await repository.AdicionarAsync(horario, ct);
        return horario.Id;
    }
}
