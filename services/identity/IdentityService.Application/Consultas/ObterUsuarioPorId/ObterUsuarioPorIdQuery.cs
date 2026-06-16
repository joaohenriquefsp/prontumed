using IdentityService.Application.DTOs;
using MediatR;

namespace IdentityService.Application.Consultas.ObterUsuarioPorId;

public record ObterUsuarioPorIdQuery(Guid Id) : IRequest<UsuarioDto>;
