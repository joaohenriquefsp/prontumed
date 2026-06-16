using IdentityService.Application.Interfaces;
using IdentityService.Domain.Excecoes;
using IdentityService.Domain.Repositorios;
using MediatR;

namespace IdentityService.Application.Comandos.AlterarPerfil;

public class AlterarPerfilCommandHandler(
    IUsuarioRepository usuarioRepo,
    IOutboxPublisher outbox
) : IRequestHandler<AlterarPerfilCommand>
{
    public async Task Handle(AlterarPerfilCommand command, CancellationToken ct)
    {
        var usuario = await usuarioRepo.ObterPorIdAsync(command.UsuarioId, ct)
            ?? throw new UsuarioNaoEncontradoException(command.UsuarioId);

        usuario.AlterarPerfil(command.NovoPerfil);
        await usuarioRepo.AtualizarAsync(usuario, ct);
        await outbox.PublicarEventosAsync(usuario, ct);
        usuario.LimparEventos();
    }
}
