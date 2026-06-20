namespace MedicalRecordService.Domain.Repositories;

public interface ILogAcessoRepository
{
    Task RegistrarAsync(Guid idProntuario, Guid idUsuarioAcesso, string acao, CancellationToken ct = default);
}
