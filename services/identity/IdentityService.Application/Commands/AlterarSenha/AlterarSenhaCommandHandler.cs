using IdentityService.Application.Interfaces;
using IdentityService.Domain.Exceptions;
using IdentityService.Domain.Repositories;
using MediatR;

namespace IdentityService.Application.Commands.AlterarSenha;

public class AlterarSenhaCommandHandler(
    IUsuarioRepository usuarioRepo,
    IHashService hashService
) : IRequestHandler<AlterarSenhaCommand>
{
    public async Task Handle(AlterarSenhaCommand command, CancellationToken ct)
    {
        var usuario = await usuarioRepo.ObterPorIdAsync(command.UsuarioId, ct)
            ?? throw new UsuarioNaoEncontradoException(command.UsuarioId);

        if (!hashService.Verificar(command.SenhaAtual, usuario.HashSenha))
            throw new CredenciaisInvalidasException();

        usuario.AlterarSenha(hashService.Gerar(command.NovaSenha));
        await usuarioRepo.AtualizarAsync(usuario, ct);
    }
}
