using MediatR;

namespace IdentityService.Application.Comandos.DesativarUsuario;

public record DesativarUsuarioCommand(Guid UsuarioId) : IRequest;
