using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AppointmentService.API.Requests;
using AppointmentService.Application.Commands.AgendarConsulta;
using AppointmentService.Application.Commands.CancelarConsulta;
using AppointmentService.Application.Commands.ConcluirConsulta;
using AppointmentService.Application.Commands.ConfirmarConsulta;
using AppointmentService.Application.Commands.RegistrarNoShow;
using AppointmentService.Application.Queries.ListarConsultas;
using AppointmentService.Application.Queries.ObterConsultaPorId;

namespace AppointmentService.API.Controllers;

[ApiController]
[Route("consultas")]
[Authorize]
public class ConsultasController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = "Receptionist,Admin")]
    public async Task<IActionResult> Agendar([FromBody] AgendarConsultaRequest request, CancellationToken ct)
    {
        var id = await mediator.Send(new AgendarConsultaCommand(
            request.IdPaciente, request.IdMedico, request.AgendadoPara,
            request.DuracaoMinutos, request.Observacoes), ct);
        return CreatedAtAction(nameof(ObterPorId), new { id }, new { id });
    }

    [HttpGet]
    [Authorize(Roles = "Receptionist,Admin,Doctor")]
    public async Task<IActionResult> Listar(
        [FromQuery] Guid? idMedico, [FromQuery] Guid? idPaciente,
        [FromQuery] string? status, [FromQuery] DateTime? dataInicio, [FromQuery] DateTime? dataFim,
        [FromQuery] int pagina = 1, [FromQuery] int tamanhoPagina = 20, CancellationToken ct = default)
    {
        var resultado = await mediator.Send(
            new ListarConsultasQuery(idMedico, idPaciente, status, dataInicio, dataFim, pagina, tamanhoPagina), ct);
        return Ok(resultado);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Receptionist,Admin,Doctor")]
    public async Task<IActionResult> ObterPorId(Guid id, CancellationToken ct)
    {
        var consulta = await mediator.Send(new ObterConsultaPorIdQuery(id), ct);
        return Ok(consulta);
    }

    [HttpPatch("{id:guid}/confirmar")]
    [Authorize(Roles = "Receptionist,Admin")]
    public async Task<IActionResult> Confirmar(Guid id, CancellationToken ct)
    {
        await mediator.Send(new ConfirmarConsultaCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/cancelar")]
    [Authorize(Roles = "Receptionist,Admin")]
    public async Task<IActionResult> Cancelar(Guid id, [FromBody] CancelarConsultaRequest request, CancellationToken ct)
    {
        await mediator.Send(new CancelarConsultaCommand(id, request.Motivo), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/concluir")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> Concluir(Guid id, [FromBody] ConcluirConsultaRequest request, CancellationToken ct)
    {
        await mediator.Send(new ConcluirConsultaCommand(id, request.Observacoes), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/no-show")]
    [Authorize(Roles = "Doctor,Admin")]
    public async Task<IActionResult> RegistrarNoShow(Guid id, CancellationToken ct)
    {
        await mediator.Send(new RegistrarNoShowCommand(id), ct);
        return NoContent();
    }
}
