using IdentityService.Application.DTOs;
using IdentityService.Domain.Exceptions;
using IdentityService.Domain.Repositories;
using MediatR;

namespace IdentityService.Application.Queries.ObterUsuarioPorId;

public class ObterUsuarioPorIdQueryHandler(
    IUsuarioRepository usuarioRepo
) : IRequestHandler<ObterUsuarioPorIdQuery, UsuarioDto>
{
    public async Task<UsuarioDto> Handle(ObterUsuarioPorIdQuery query, CancellationToken ct)
    {
        var usuario = await usuarioRepo.ObterPorIdAsync(query.Id, ct)
            ?? throw new UsuarioNaoEncontradoException(query.Id);

        return new UsuarioDto(usuario.Id, usuario.Email, usuario.PrimeiroNome, usuario.Sobrenome, usuario.Perfil, usuario.Ativo);
    }
}
