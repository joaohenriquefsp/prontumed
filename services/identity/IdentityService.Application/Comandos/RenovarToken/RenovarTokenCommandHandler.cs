using IdentityService.Application.DTOs;
using IdentityService.Application.Interfaces;
using IdentityService.Domain.Entidades;
using IdentityService.Domain.Excecoes;
using IdentityService.Domain.Repositorios;
using MediatR;

namespace IdentityService.Application.Comandos.RenovarToken;

public class RenovarTokenCommandHandler(
    ITokenRenovacaoRepository tokenRepo,
    IUsuarioRepository usuarioRepo,
    IHashService hashService,
    IJwtService jwtService
) : IRequestHandler<RenovarTokenCommand, TokenDto>
{
    public async Task<TokenDto> Handle(RenovarTokenCommand command, CancellationToken ct)
    {
        var hashToken = hashService.Gerar(command.RefreshToken);

        var token = await tokenRepo.ObterPorHashAsync(hashToken, ct)
            ?? throw new TokenInvalidoException();

        if (!token.EstaValido())
            throw new TokenInvalidoException();

        var usuario = await usuarioRepo.ObterPorIdAsync(token.IdUsuario, ct)
            ?? throw new TokenInvalidoException();

        token.Revogar();
        await tokenRepo.AtualizarAsync(token, ct);

        var novoAccessToken = jwtService.GerarAccessToken(usuario);
        var novoRefreshToken = jwtService.GerarRefreshToken();
        var expiraEm = DateTime.UtcNow.AddDays(7);

        var novoToken = new TokenRenovacao(usuario.Id, hashService.Gerar(novoRefreshToken), expiraEm);
        await tokenRepo.AdicionarAsync(novoToken, ct);

        return new TokenDto(novoAccessToken, novoRefreshToken, expiraEm);
    }
}
