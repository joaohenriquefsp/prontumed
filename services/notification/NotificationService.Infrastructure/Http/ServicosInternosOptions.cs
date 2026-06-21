namespace NotificationService.Infrastructure.Http;

public class ServicosInternosOptions
{
    public const string SectionName = "ServicosInternos";

    public string PatientServiceUrl { get; set; } = string.Empty;
    public string IdentityServiceUrl { get; set; } = string.Empty;
}
