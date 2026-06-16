using IdentityService.API.Requisicoes;
using IdentityService.Application.Comandos.AlterarPerfil;
using IdentityService.Application.Comandos.CriarUsuario;
using IdentityService.Application.Comandos.DesativarUsuario;
using IdentityService.Application.Consultas.ListarUsuarios;
using IdentityService.Application.Consultas.ObterUsuarioPorId;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IdentityService.API.Controladores;

[ApiController]
[Route("usuarios")]
[Authorize]
public class UsuariosController(IMediator mediator) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> ObterAtual(CancellationToken ct)
    {
        var usuarioId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resultado = await mediator.Send(new ObterUsuarioPorIdQuery(usuarioId), ct);
        return Ok(resultado);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Listar(
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanhoPagina = 20,
        CancellationToken ct = default)
    {
        var resultado = await mediator.Send(new ListarUsuariosQuery(pagina, tamanhoPagina), ct);
        return Ok(resultado);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ObterPorId(Guid id, CancellationToken ct)
    {
        var resultado = await mediator.Send(new ObterUsuarioPorIdQuery(id), ct);
        return Ok(resultado);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Criar([FromBody] CriarUsuarioCommand command, CancellationToken ct)
    {
        var id = await mediator.Send(command, ct);
        return CreatedAtAction(nameof(ObterPorId), new { id }, new { id });
    }

    [HttpPatch("{id:guid}/perfil")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AlterarPerfil(Guid id, [FromBody] AlterarPerfilRequest request, CancellationToken ct)
    {
        await mediator.Send(new AlterarPerfilCommand(id, request.NovoPerfil), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/desativar")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Desativar(Guid id, CancellationToken ct)
    {
        await mediator.Send(new DesativarUsuarioCommand(id), ct);
        return NoContent();
    }
}
