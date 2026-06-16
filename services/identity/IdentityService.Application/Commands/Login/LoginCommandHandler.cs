using IdentityService.Application.DTOs;
using IdentityService.Application.Interfaces;
using IdentityService.Domain.Entities;
using IdentityService.Domain.Exceptions;
using IdentityService.Domain.Repositories;
using MediatR;

namespace IdentityService.Application.Commands.Login;

public class LoginCommandHandler(
    IUsuarioRepository usuarioRepo,
    ITokenRenovacaoRepository tokenRepo,
    IHashService hashService,
    IJwtService jwtService
) : IRequestHandler<LoginCommand, TokenDto>
{
    public async Task<TokenDto> Handle(LoginCommand command, CancellationToken ct)
    {
        var usuario = await usuarioRepo.ObterPorEmailAsync(command.Email, ct)
            ?? throw new CredenciaisInvalidasException();

        if (!usuario.Ativo || !hashService.Verificar(command.Senha, usuario.HashSenha))
            throw new CredenciaisInvalidasException();

        var accessToken = jwtService.GerarAccessToken(usuario);
        var refreshTokenValor = jwtService.GerarRefreshToken();
        var expiraEm = DateTime.UtcNow.AddDays(7);

        var tokenRenovacao = new TokenRenovacao(usuario.Id, hashService.Gerar(refreshTokenValor), expiraEm);
        await tokenRepo.AdicionarAsync(tokenRenovacao, ct);

        return new TokenDto(accessToken, refreshTokenValor, expiraEm);
    }
}
