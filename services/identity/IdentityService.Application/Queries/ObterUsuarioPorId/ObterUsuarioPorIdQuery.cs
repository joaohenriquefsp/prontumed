using IdentityService.Application.DTOs;
using MediatR;

namespace IdentityService.Application.Queries.ObterUsuarioPorId;

public record ObterUsuarioPorIdQuery(Guid Id) : IRequest<UsuarioDto>;
