using IdentityService.Application.DTOs;
using IdentityService.Domain.Repositorios;
using MediatR;

namespace IdentityService.Application.Consultas.ListarUsuarios;

public class ListarUsuariosQueryHandler(
    IUsuarioRepository usuarioRepo
) : IRequestHandler<ListarUsuariosQuery, IEnumerable<UsuarioDto>>
{
    public async Task<IEnumerable<UsuarioDto>> Handle(ListarUsuariosQuery query, CancellationToken ct)
    {
        var usuarios = await usuarioRepo.ListarAsync(query.Pagina, query.TamanhoPagina, ct);

        return usuarios.Select(u =>
            new UsuarioDto(u.Id, u.Email, u.PrimeiroNome, u.Sobrenome, u.Perfil, u.Ativo));
    }
}
