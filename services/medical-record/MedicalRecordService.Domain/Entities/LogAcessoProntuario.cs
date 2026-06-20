namespace MedicalRecordService.Domain.Entities;

// Linha de log_acesso_prontuario — auditoria de acesso exigida por LGPD/CFM.
public class LogAcessoProntuario
{
    public Guid Id { get; set; }
    public Guid IdProntuario { get; set; }
    public Guid IdUsuarioAcesso { get; set; }
    public DateTime AcessadoEm { get; set; }
    public string Acao { get; set; } = string.Empty;
}
