namespace NotificationService.Domain.Entities;

public static class Canal
{
    public const string Email = "Email";
    public const string Push = "Push";

    private static readonly HashSet<string> _validos = [Email, Push];

    public static bool EhValido(string canal) => _validos.Contains(canal);
}
