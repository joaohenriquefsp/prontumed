using IdentityService.Application.Interfaces;
using IdentityService.Domain.Entidades;
using IdentityService.Domain.Excecoes;
using IdentityService.Domain.Repositorios;
using MediatR;

namespace IdentityService.Application.Comandos.CriarUsuario;

public class CriarUsuarioCommandHandler(
    IUsuarioRepository usuarioRepo,
    IHashService hashService,
    IOutboxPublisher outbox
) : IRequestHandler<CriarUsuarioCommand, Guid>
{
    public async Task<Guid> Handle(CriarUsuarioCommand command, CancellationToken ct)
    {
        if (await usuarioRepo.EmailExisteAsync(command.Email, ct))
            throw new EmailJaCadastradoException(command.Email);

        var hashSenha = hashService.Gerar(command.Senha);
        var usuario = new Usuario(command.Email, hashSenha, command.PrimeiroNome, command.Sobrenome, command.Perfil);

        await usuarioRepo.AdicionarAsync(usuario, ct);
        await outbox.PublicarEventosAsync(usuario, ct);
        usuario.LimparEventos();

        return usuario.Id;
    }
}
