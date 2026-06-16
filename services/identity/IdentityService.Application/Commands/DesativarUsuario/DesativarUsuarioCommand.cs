using MediatR;

namespace IdentityService.Application.Commands.DesativarUsuario;

public record DesativarUsuarioCommand(Guid UsuarioId) : IRequest;
