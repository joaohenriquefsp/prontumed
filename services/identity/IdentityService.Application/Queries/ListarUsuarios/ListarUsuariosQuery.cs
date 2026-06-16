using IdentityService.Application.DTOs;
using MediatR;

namespace IdentityService.Application.Queries.ListarUsuarios;

public record ListarUsuariosQuery(int Pagina = 1, int TamanhoPagina = 20) : IRequest<IEnumerable<UsuarioDto>>;
