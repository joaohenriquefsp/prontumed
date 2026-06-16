using MediatR;

namespace IdentityService.Application.Comandos.AlterarPerfil;

public record AlterarPerfilCommand(Guid UsuarioId, string NovoPerfil) : IRequest;
