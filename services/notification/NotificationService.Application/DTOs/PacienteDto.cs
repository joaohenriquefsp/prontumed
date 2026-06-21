namespace NotificationService.Application.DTOs;

// Subconjunto do PacienteDto exposto por GET /pacientes/{id}/interno —
// só os campos que o Notification Service precisa para montar a mensagem.
public record PacienteDto(Guid Id, string PrimeiroNome, string Sobrenome, string? Email, string? Telefone);
