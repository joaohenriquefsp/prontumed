using MediatR;
using MedicalRecordService.Application.DTOs;
using MedicalRecordService.Domain.Entities;
using MedicalRecordService.Domain.Exceptions;
using MedicalRecordService.Domain.Repositories;

namespace MedicalRecordService.Application.Queries.ObterEntrada;

public class ObterEntradaHandler(
    IProntuarioRepository repository,
    ILogAcessoRepository logAcesso
) : IRequestHandler<ObterEntradaQuery, EntradaDto>
{
    public async Task<EntradaDto> Handle(ObterEntradaQuery query, CancellationToken ct)
    {
        if (!await repository.ExisteAsync(query.IdPaciente, ct))
            throw new ProntuarioNaoEncontradoException(query.IdPaciente);

        var entrada = await repository.ObterEntradaAsync(query.IdPaciente, query.IdEntrada, ct)
            ?? throw new EntradaNaoEncontradaException(query.IdEntrada);

        await logAcesso.RegistrarAsync(query.IdPaciente, query.IdUsuarioAcesso, AcaoAcessoProntuario.Viewed, ct);

        return new EntradaDto(entrada.Id, entrada.IdMedico, entrada.Tipo, entrada.Conteudo, entrada.OcorreuEm);
    }
}
