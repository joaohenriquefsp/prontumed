using MediatR;
using MedicalRecordService.Application.DTOs;
using MedicalRecordService.Domain.Entities;
using MedicalRecordService.Domain.Exceptions;
using MedicalRecordService.Domain.Repositories;

namespace MedicalRecordService.Application.Queries.ObterProntuario;

public class ObterProntuarioHandler(
    IProntuarioRepository repository,
    ILogAcessoRepository logAcesso
) : IRequestHandler<ObterProntuarioQuery, ProntuarioDto>
{
    public async Task<ProntuarioDto> Handle(ObterProntuarioQuery query, CancellationToken ct)
    {
        var prontuario = await repository.ObterPorIdPacienteAsync(query.IdPaciente, ct)
            ?? throw new ProntuarioNaoEncontradoException(query.IdPaciente);

        // Exceção deliberada à regra "queries nunca alteram estado": exigência de auditoria LGPD/CFM.
        await logAcesso.RegistrarAsync(query.IdPaciente, query.IdUsuarioAcesso, AcaoAcessoProntuario.Viewed, ct);

        return new ProntuarioDto(
            prontuario.Id,
            prontuario.IdPaciente,
            prontuario.CriadoEm,
            prontuario.Entradas.Select(e => new EntradaDto(e.Id, e.IdMedico, e.Tipo, e.Conteudo, e.OcorreuEm)).ToList());
    }
}
