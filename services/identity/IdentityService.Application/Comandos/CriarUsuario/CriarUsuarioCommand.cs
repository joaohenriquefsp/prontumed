using MediatR;

namespace IdentityService.Application.Comandos.CriarUsuario;

public record CriarUsuarioCommand(
    string Email,
    string Senha,
    string PrimeiroNome,
    string Sobrenome,
    string Perfil
) : IRequest<Guid>;
