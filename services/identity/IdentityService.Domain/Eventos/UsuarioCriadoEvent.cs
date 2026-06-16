namespace IdentityService.Domain.Eventos;

public record UsuarioCriadoEvent(
    Guid UsuarioId,
    string Email,
    string Perfil,
    string PrimeiroNome
) : IDomainEvent;
