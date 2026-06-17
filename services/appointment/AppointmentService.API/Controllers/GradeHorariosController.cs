using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AppointmentService.API.Requests;
using AppointmentService.Application.Commands.CriarGradeHorario;
using AppointmentService.Application.Commands.RemoverGradeHorario;
using AppointmentService.Application.Queries.ListarGradeHorarios;

namespace AppointmentService.API.Controllers;

[ApiController]
[Route("grade-horarios")]
[Authorize]
public class GradeHorariosController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Criar([FromBody] CriarGradeHorarioRequest request, CancellationToken ct)
    {
        var id = await mediator.Send(new CriarGradeHorarioCommand(
            request.IdMedico, request.DiaSemana, request.HorarioInicio,
            request.HorarioFim, request.DuracaoSlotMinutos), ct);
        return Created(string.Empty, new { id });
    }

    [HttpGet]
    [Authorize(Roles = "Receptionist,Admin,Doctor")]
    public async Task<IActionResult> Listar([FromQuery] Guid idMedico, CancellationToken ct)
    {
        var grades = await mediator.Send(new ListarGradeHorariosQuery(idMedico), ct);
        return Ok(grades);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Remover(Guid id, CancellationToken ct)
    {
        await mediator.Send(new RemoverGradeHorarioCommand(id), ct);
        return NoContent();
    }
}
