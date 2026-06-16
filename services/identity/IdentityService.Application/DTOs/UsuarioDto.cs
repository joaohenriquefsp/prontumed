namespace IdentityService.Application.DTOs;

public record UsuarioDto(
    Guid Id,
    string Email,
    string PrimeiroNome,
    string Sobrenome,
    string Perfil,
    bool Ativo
);
