using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatientService.Application.Commands.AtualizarPaciente;
using PatientService.Application.Commands.CadastrarPaciente;
using PatientService.Application.Commands.DesativarPaciente;
using PatientService.Application.Queries.ListarPacientes;
using PatientService.Application.Queries.ObterPacientePorCpf;
using PatientService.Application.Queries.ObterPacientePorId;
using PatientService.API.Requests;

namespace PatientService.API.Controllers;

[ApiController]
[Route("pacientes")]
[Authorize]
public class PacientesController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = "Receptionist,Admin")]
    public async Task<IActionResult> Cadastrar(
        [FromBody] CadastrarPacienteRequest req,
        CancellationToken ct)
    {
        var cmd = new CadastrarPacienteCommand(
            req.PrimeiroNome, req.Sobrenome, req.Cpf, req.DataNascimento,
            req.Sexo, req.Telefone, req.Email,
            req.Logradouro, req.Cidade, req.Uf, req.Cep,
            req.IdUsuario);

        var id = await mediator.Send(cmd, ct);

        return CreatedAtAction(nameof(ObterPorId), new { id }, new { id });
    }

    [HttpGet]
    [Authorize(Roles = "Receptionist,Admin,Doctor")]
    public async Task<IActionResult> Listar(
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanhoPagina = 20,
        [FromQuery] string? nome = null,
        [FromQuery] string? cpf = null,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(
            new ListarPacientesQuery(pagina, tamanhoPagina, nome, cpf), ct);

        return Ok(new { result.Total, Itens = result.Itens });
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Receptionist,Admin,Doctor")]
    public async Task<IActionResult> ObterPorId(Guid id, CancellationToken ct)
    {
        var dto = await mediator.Send(new ObterPacientePorIdQuery(id), ct);
        return Ok(dto);
    }

    [HttpGet("cpf/{cpf}")]
    [Authorize(Roles = "Receptionist,Admin,Doctor")]
    public async Task<IActionResult> ObterPorCpf(string cpf, CancellationToken ct)
    {
        var dto = await mediator.Send(new ObterPacientePorCpfQuery(cpf), ct);
        return Ok(dto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Receptionist,Admin")]
    public async Task<IActionResult> Atualizar(
        Guid id,
        [FromBody] AtualizarPacienteRequest req,
        CancellationToken ct)
    {
        var cmd = new AtualizarPacienteCommand(
            id, req.PrimeiroNome, req.Sobrenome, req.DataNascimento,
            req.Sexo, req.Telefone, req.Email,
            req.Logradouro, req.Cidade, req.Uf, req.Cep);

        await mediator.Send(cmd, ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/desativar")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Desativar(Guid id, CancellationToken ct)
    {
        await mediator.Send(new DesativarPacienteCommand(id), ct);
        return NoContent();
    }
}
