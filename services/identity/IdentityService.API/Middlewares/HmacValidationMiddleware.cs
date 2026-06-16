using System.Security.Cryptography;
using System.Text;

namespace IdentityService.API.Middlewares;

public class HmacValidationMiddleware(RequestDelegate next, IConfiguration config)
{
    private static readonly string[] RotasLiberadas = ["/health", "/scalar", "/openapi"];

    public async Task InvokeAsync(HttpContext context)
    {
        if (RotasLiberadas.Any(r => context.Request.Path.StartsWithSegments(r)))
        {
            await next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue("X-HMAC-Signature", out var assinatura) ||
            !context.Request.Headers.TryGetValue("X-HMAC-Timestamp", out var timestamp))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("Assinatura HMAC ausente.");
            return;
        }

        if (!TimestampValido(timestamp!))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("Timestamp expirado.");
            return;
        }

        var chave = config["Hmac:Chave"]!;
        var mensagem = $"{context.Request.Method}{context.Request.Path}{timestamp}";
        var assinaturaEsperada = GerarHmac(mensagem, chave);

        if (!CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(assinatura!),
                Encoding.UTF8.GetBytes(assinaturaEsperada)))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("Assinatura HMAC inválida.");
            return;
        }

        await next(context);
    }

    private static bool TimestampValido(string timestamp)
    {
        if (!long.TryParse(timestamp, out var ts)) return false;
        return Math.Abs(DateTimeOffset.UtcNow.ToUnixTimeSeconds() - ts) <= 300;
    }

    private static string GerarHmac(string mensagem, string chave)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(chave));
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(mensagem))).ToLower();
    }
}
