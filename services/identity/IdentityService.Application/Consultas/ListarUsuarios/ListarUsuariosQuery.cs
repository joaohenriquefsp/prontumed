using IdentityService.Application.DTOs;
using MediatR;

namespace IdentityService.Application.Consultas.ListarUsuarios;

public record ListarUsuariosQuery(int Pagina = 1, int TamanhoPagina = 20) : IRequest<IEnumerable<UsuarioDto>>;
