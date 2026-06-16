using MediatR;

namespace IdentityService.Application.Comandos.AlterarSenha;

public record AlterarSenhaCommand(
    Guid UsuarioId,
    string SenhaAtual,
    string NovaSenha
) : IRequest;
