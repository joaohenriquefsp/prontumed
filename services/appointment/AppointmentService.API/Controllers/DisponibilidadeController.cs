using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AppointmentService.Application.Queries.ObterDisponibilidade;

namespace AppointmentService.API.Controllers;

[ApiController]
[Route("disponibilidade")]
[Authorize]
public class DisponibilidadeController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Receptionist,Admin")]
    public async Task<IActionResult> Obter([FromQuery] Guid idMedico, [FromQuery] DateOnly data, CancellationToken ct)
    {
        var resultado = await mediator.Send(new ObterDisponibilidadeQuery(idMedico, data), ct);
        return Ok(resultado);
    }
}
