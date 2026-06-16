using IdentityService.Domain.Excecoes;
using IdentityService.Domain.Repositorios;
using MediatR;

namespace IdentityService.Application.Comandos.DesativarUsuario;

public class DesativarUsuarioCommandHandler(
    IUsuarioRepository usuarioRepo,
    ITokenRenovacaoRepository tokenRepo
) : IRequestHandler<DesativarUsuarioCommand>
{
    public async Task Handle(DesativarUsuarioCommand command, CancellationToken ct)
    {
        var usuario = await usuarioRepo.ObterPorIdAsync(command.UsuarioId, ct)
            ?? throw new UsuarioNaoEncontradoException(command.UsuarioId);

        usuario.Desativar();
        await usuarioRepo.AtualizarAsync(usuario, ct);
        await tokenRepo.RevogarTodosDoUsuarioAsync(command.UsuarioId, ct);
    }
}
