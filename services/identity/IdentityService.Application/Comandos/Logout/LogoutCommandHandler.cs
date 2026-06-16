using IdentityService.Application.Interfaces;
using IdentityService.Domain.Excecoes;
using IdentityService.Domain.Repositorios;
using MediatR;

namespace IdentityService.Application.Comandos.Logout;

public class LogoutCommandHandler(
    ITokenRenovacaoRepository tokenRepo,
    IHashService hashService
) : IRequestHandler<LogoutCommand>
{
    public async Task Handle(LogoutCommand command, CancellationToken ct)
    {
        var hashToken = hashService.Gerar(command.RefreshToken);

        var token = await tokenRepo.ObterPorHashAsync(hashToken, ct)
            ?? throw new TokenInvalidoException();

        token.Revogar();
        await tokenRepo.AtualizarAsync(token, ct);
    }
}
