using MedicalRecordService.Domain.Entities;
using MedicalRecordService.Domain.Repositories;

namespace MedicalRecordService.Infrastructure.Persistence.Repositories;

public class LogAcessoRepository(AppDbContext context) : ILogAcessoRepository
{
    public async Task RegistrarAsync(Guid idProntuario, Guid idUsuarioAcesso, string acao, CancellationToken ct = default)
    {
        await context.LogsAcesso.AddAsync(new LogAcessoProntuario
        {
            Id = Guid.NewGuid(),
            IdProntuario = idProntuario,
            IdUsuarioAcesso = idUsuarioAcesso,
            Acao = acao,
            AcessadoEm = DateTime.UtcNow
        }, ct);

        // Esta entidade não levanta eventos de domínio — sem outbox para piggyback,
        // o próprio repositório grava (mesma regra do GradeHorarioRepository no Appointment).
        await context.SaveChangesAsync(ct);
    }
}
