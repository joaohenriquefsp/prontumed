using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AppointmentService.API.Requests;
using AppointmentService.Application.Commands.BloquearHorario;
using AppointmentService.Application.Commands.DesbloquearHorario;

namespace AppointmentService.API.Controllers;

[ApiController]
[Route("horarios-bloqueados")]
[Authorize]
public class HorariosBloqueadosController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Bloquear([FromBody] BloquearHorarioRequest request, CancellationToken ct)
    {
        var id = await mediator.Send(new BloquearHorarioCommand(
            request.IdMedico, request.InicioEm, request.FimEm, request.Motivo), ct);
        return Created(string.Empty, new { id });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Desbloquear(Guid id, CancellationToken ct)
    {
        await mediator.Send(new DesbloquearHorarioCommand(id), ct);
        return NoContent();
    }
}
