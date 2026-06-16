namespace IdentityService.Domain.Excecoes;

public class UsuarioNaoEncontradoException(Guid id)
    : Exception($"Usuário com ID '{id}' não encontrado.");
