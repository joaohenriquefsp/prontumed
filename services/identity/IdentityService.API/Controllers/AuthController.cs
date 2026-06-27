using IdentityService.API.Requests;
using IdentityService.Application.Commands.AlterarSenha;
using IdentityService.Application.Commands.Login;
using IdentityService.Application.Commands.Logout;
using IdentityService.Application.Commands.RenovarToken;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IdentityService.API.Controllers;

[ApiController]
[Route("auth")]
public class AuthController(IMediator mediator) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken ct)
    {
        var token = await mediator.Send(command, ct);

        Response.Cookies.Append("access_token", token.AccessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            // Cookie dura mais que o JWT (15 min) para o middleware Next.js
            // não redirecionar para /login antes do cliente poder chamar /auth/refresh.
            // A validade real do token é verificada server-side pelo BFF.
            Expires = DateTimeOffset.UtcNow.AddDays(1)
        });

        Response.Cookies.Append("refresh_token", token.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = token.ExpiraEm
        });

        return Ok(new { expiraEm = token.ExpiraEm });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken ct)
    {
        var refreshToken = Request.Cookies["refresh_token"];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized();

        var token = await mediator.Send(new RenovarTokenCommand(refreshToken), ct);

        Response.Cookies.Append("access_token", token.AccessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(1)
        });

        Response.Cookies.Append("refresh_token", token.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = token.ExpiraEm
        });

        return Ok(new { expiraEm = token.ExpiraEm });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var refreshToken = Request.Cookies["refresh_token"];
        if (!string.IsNullOrEmpty(refreshToken))
            await mediator.Send(new LogoutCommand(refreshToken), ct);

        Response.Cookies.Delete("access_token");
        Response.Cookies.Delete("refresh_token");

        return NoContent();
    }

    [HttpPost("alterar-senha")]
    [Authorize]
    public async Task<IActionResult> AlterarSenha([FromBody] AlterarSenhaRequest request, CancellationToken ct)
    {
        var usuarioId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await mediator.Send(new AlterarSenhaCommand(usuarioId, request.SenhaAtual, request.NovaSenha), ct);
        return NoContent();
    }
}
