namespace IdentityService.Domain.Excecoes;

public class EmailJaCadastradoException(string email)
    : Exception($"O e-mail '{email}' já está cadastrado no sistema.");
