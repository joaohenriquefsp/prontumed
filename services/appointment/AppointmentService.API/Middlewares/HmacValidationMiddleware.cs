using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace AppointmentService.API.Middlewares;

public class HmacValidationMiddleware(RequestDelegate next, IConfiguration configuration)
{
    private static readonly string[] RotasLiberadas = ["/health", "/scalar", "/openapi"];

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? string.Empty;
        if (RotasLiberadas.Any(r => path.StartsWith(r, StringComparison.OrdinalIgnoreCase)))
        {
            await next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue("X-HMAC-Signature", out var assinatura) ||
            !context.Request.Headers.TryGetValue("X-HMAC-Timestamp", out var timestampStr))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { mensagem = "Assinatura HMAC ausente." }));
            return;
        }

        if (!long.TryParse(timestampStr, out var timestamp))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { mensagem = "Timestamp inválido." }));
            return;
        }

        var agora = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        if (Math.Abs(agora - timestamp) > 300)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { mensagem = "Timestamp expirado." }));
            return;
        }

        var chave = configuration["Hmac:Chave"] ?? string.Empty;
        var mensagem = $"{context.Request.Method}{context.Request.Path}{timestamp}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(chave));
        var hashEsperado = Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(mensagem))).ToLowerInvariant();
        var hashRecebido = assinatura.ToString().ToLowerInvariant();

        if (!CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(hashEsperado),
            Encoding.UTF8.GetBytes(hashRecebido)))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { mensagem = "Assinatura HMAC inválida." }));
            return;
        }

        await next(context);
    }
}
