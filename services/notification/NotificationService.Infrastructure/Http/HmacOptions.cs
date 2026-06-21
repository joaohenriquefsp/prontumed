namespace NotificationService.Infrastructure.Http;

public class HmacOptions
{
    public const string SectionName = "Hmac";

    public string Chave { get; set; } = string.Empty;
}
