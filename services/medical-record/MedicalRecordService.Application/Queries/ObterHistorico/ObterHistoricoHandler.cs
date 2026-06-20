using MediatR;
using MedicalRecordService.Application.DTOs;
using MedicalRecordService.Domain.Entities;
using MedicalRecordService.Domain.Repositories;

namespace MedicalRecordService.Application.Queries.ObterHistorico;

public class ObterHistoricoHandler(
    IProntuarioRepository repository,
    ILogAcessoRepository logAcesso
) : IRequestHandler<ObterHistoricoQuery, IReadOnlyList<EventoHistoricoDto>>
{
    public async Task<IReadOnlyList<EventoHistoricoDto>> Handle(ObterHistoricoQuery query, CancellationToken ct)
    {
        var historico = await repository.ObterHistoricoAsync(query.IdPaciente, ct);

        await logAcesso.RegistrarAsync(query.IdPaciente, query.IdUsuarioAcesso, AcaoAcessoProntuario.Viewed, ct);

        return historico
            .Select(e => new EventoHistoricoDto(e.Id, e.TipoEvento, e.Versao, e.Payload, e.OcorreuEm))
            .ToList();
    }
}
