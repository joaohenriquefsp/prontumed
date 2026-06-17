using MediatR;
using AppointmentService.Application.DTOs;
using AppointmentService.Domain.Repositories;

namespace AppointmentService.Application.Queries.ObterDisponibilidade;

public class ObterDisponibilidadeHandler(
    IGradeHorarioRepository gradeRepository,
    IConsultaRepository consultaRepository,
    IHorarioBloqueadoRepository bloqueioRepository
) : IRequestHandler<ObterDisponibilidadeQuery, ObterDisponibilidadeResult>
{
    public async Task<ObterDisponibilidadeResult> Handle(ObterDisponibilidadeQuery query, CancellationToken ct)
    {
        var diaSemana = (int)query.Data.DayOfWeek;
        var grades = await gradeRepository.ListarPorMedicoEDiaAsync(query.IdMedico, diaSemana, ct);

        var inicioDia = new DateTime(query.Data.Year, query.Data.Month, query.Data.Day, 0, 0, 0, DateTimeKind.Utc);
        var fimDia = inicioDia.AddDays(1).AddTicks(-1);

        var consultasExistentes = await consultaRepository.ListarPorMedicoEDataAsync(query.IdMedico, query.Data, ct);
        var bloqueios = await bloqueioRepository.ListarPorMedicoEPeriodoAsync(query.IdMedico, inicioDia, fimDia, ct);

        var slots = new List<SlotDisponibilidadeDto>();

        foreach (var grade in grades.Where(g => g.Ativo))
        {
            var slotInicio = new DateTime(
                query.Data.Year, query.Data.Month, query.Data.Day,
                grade.HorarioInicio.Hour, grade.HorarioInicio.Minute, 0, DateTimeKind.Utc);
            var gradeFim = new DateTime(
                query.Data.Year, query.Data.Month, query.Data.Day,
                grade.HorarioFim.Hour, grade.HorarioFim.Minute, 0, DateTimeKind.Utc);

            while (slotInicio.AddMinutes(grade.DuracaoSlotMinutos) <= gradeFim)
            {
                var slotFim = slotInicio.AddMinutes(grade.DuracaoSlotMinutos);

                var ocupado = consultasExistentes.Any(c =>
                    c.AgendadoPara < slotFim &&
                    c.AgendadoPara.AddMinutes(c.DuracaoMinutos) > slotInicio);

                var bloqueado = bloqueios.Any(b => b.InicioEm < slotFim && b.FimEm > slotInicio);

                if (!ocupado && !bloqueado)
                    slots.Add(new SlotDisponibilidadeDto(slotInicio, slotFim, grade.DuracaoSlotMinutos));

                slotInicio = slotFim;
            }
        }

        return new ObterDisponibilidadeResult(slots);
    }
}
