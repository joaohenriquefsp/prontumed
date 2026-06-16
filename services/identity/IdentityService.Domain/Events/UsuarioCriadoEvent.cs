namespace IdentityService.Domain.Events;

public record UsuarioCriadoEvent(
    Guid UsuarioId,
    string Email,
    string Perfil,
    string PrimeiroNome
) : IDomainEvent;
