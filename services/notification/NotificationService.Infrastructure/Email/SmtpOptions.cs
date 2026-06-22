namespace NotificationService.Infrastructure.Email;

public class SmtpOptions
{
    public const string SectionName = "Smtp";

    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
    public string RemetenteEmail { get; set; } = "naoresponda@prontumed.com.br";
    public string RemetenteNome { get; set; } = "ProntuMed";
}
