namespace IdentityService.Domain.Exceptions;

public class UsuarioNaoEncontradoException(Guid id)
    : Exception($"Usuário com ID '{id}' não encontrado.");
