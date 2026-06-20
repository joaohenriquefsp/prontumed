using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MedicalRecordService.API.Requests;
using MedicalRecordService.Application.Commands.AdicionarEntrada;
using MedicalRecordService.Application.Commands.CriarProntuario;
using MedicalRecordService.Application.Queries.ObterEntrada;
using MedicalRecordService.Application.Queries.ObterHistorico;
using MedicalRecordService.Application.Queries.ObterProntuario;

namespace MedicalRecordService.API.Controllers;

[ApiController]
[Route("prontuarios")]
[Authorize]
public class ProntuariosController(IMediator mediator) : ControllerBase
{
    [HttpPost("{idPaciente:guid}")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> Criar(Guid idPaciente, CancellationToken ct)
    {
        var idMedico = ObterIdUsuarioAutenticado();
        await mediator.Send(new CriarProntuarioCommand(idPaciente, idMedico), ct);
        return CreatedAtAction(nameof(Obter), new { idPaciente }, null);
    }

    [HttpGet("{idPaciente:guid}")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> Obter(Guid idPaciente, CancellationToken ct)
    {
        var idUsuario = ObterIdUsuarioAutenticado();
        var prontuario = await mediator.Send(new ObterProntuarioQuery(idPaciente, idUsuario), ct);
        return Ok(prontuario);
    }

    [HttpPost("{idPaciente:guid}/entradas")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> AdicionarEntrada(Guid idPaciente, [FromBody] AdicionarEntradaRequest request, CancellationToken ct)
    {
        var idMedico = ObterIdUsuarioAutenticado();
        var idEntrada = await mediator.Send(
            new AdicionarEntradaCommand(idPaciente, idMedico, request.TipoEntrada, request.Conteudo), ct);
        return CreatedAtAction(nameof(ObterEntrada), new { idPaciente, idEntrada }, new { idEntrada });
    }

    [HttpGet("{idPaciente:guid}/entradas/{idEntrada:guid}")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> ObterEntrada(Guid idPaciente, Guid idEntrada, CancellationToken ct)
    {
        var idUsuario = ObterIdUsuarioAutenticado();
        var entrada = await mediator.Send(new ObterEntradaQuery(idPaciente, idEntrada, idUsuario), ct);
        return Ok(entrada);
    }

    [HttpGet("{idPaciente:guid}/historico")]
    [Authorize(Roles = "Doctor,Admin")]
    public async Task<IActionResult> ObterHistorico(Guid idPaciente, CancellationToken ct)
    {
        var idUsuario = ObterIdUsuarioAutenticado();
        var historico = await mediator.Send(new ObterHistoricoQuery(idPaciente, idUsuario), ct);
        return Ok(historico);
    }

    // Identidade de quem acessa sempre vem do JWT, nunca de parâmetro — é a base da auditoria LGPD deste serviço.
    private Guid ObterIdUsuarioAutenticado()
        => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
