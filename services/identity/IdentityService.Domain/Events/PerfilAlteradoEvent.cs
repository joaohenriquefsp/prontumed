namespace IdentityService.Domain.Events;

public record PerfilAlteradoEvent(
    Guid UsuarioId,
    string PerfilAnterior,
    string NovoPerfil
) : IDomainEvent;
