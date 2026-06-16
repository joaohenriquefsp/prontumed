namespace IdentityService.Domain.Eventos;

public record PerfilAlteradoEvent(
    Guid UsuarioId,
    string PerfilAnterior,
    string NovoPerfil
) : IDomainEvent;
