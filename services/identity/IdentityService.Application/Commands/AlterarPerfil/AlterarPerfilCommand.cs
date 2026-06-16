using MediatR;

namespace IdentityService.Application.Commands.AlterarPerfil;

public record AlterarPerfilCommand(Guid UsuarioId, string NovoPerfil) : IRequest;
