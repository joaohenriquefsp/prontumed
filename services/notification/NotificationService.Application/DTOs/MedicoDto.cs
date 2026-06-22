namespace NotificationService.Application.DTOs;

// Subconjunto do UsuarioDto exposto por GET /usuarios/{id}/interno —
// só os campos que o Notification Service precisa para montar a mensagem.
public record MedicoDto(Guid Id, string PrimeiroNome, string Sobrenome, string Email);
