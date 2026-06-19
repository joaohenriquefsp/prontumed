using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

namespace AppointmentService.API.Middlewares;

public class HmacValidationMiddleware(RequestDelegate next, IConfiguration configuration, IMemoryCache cache)
{
    private static readonly string[] RotasLiberadas = ["/health", "/scalar", "/openapi"];
    private const int JanelaSegundos = 300;

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
            await ResponderNaoAutorizado(context, "Assinatura HMAC ausente.");
            return;
        }

        if (!long.TryParse(timestampStr, out var timestamp))
        {
            await ResponderNaoAutorizado(context, "Timestamp inválido.");
            return;
        }

        var agora = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var diff = agora - timestamp;
        if (Math.Abs(diff) > JanelaSegundos)
        {
            await ResponderNaoAutorizado(context, "Timestamp expirado.");
            return;
        }

        var chave = configuration["Hmac:Chave"] ?? string.Empty;
        var queryString = context.Request.QueryString.Value ?? string.Empty;
        var mensagem = $"{context.Request.Method}{context.Request.Path}{queryString}{timestamp}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(chave));
        var hashEsperado = Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(mensagem))).ToLowerInvariant();
        var hashRecebido = assinatura.ToString().ToLowerInvariant();

        if (!CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(hashEsperado),
            Encoding.UTF8.GetBytes(hashRecebido)))
        {
            await ResponderNaoAutorizado(context, "Assinatura HMAC inválida.");
            return;
        }

        var nonceKey = $"hmac:{hashRecebido}";
        if (cache.TryGetValue(nonceKey, out _))
        {
            await ResponderNaoAutorizado(context, "Requisição duplicada.");
            return;
        }

        var ttl = JanelaSegundos - (int)Math.Abs(diff);
        cache.Set(nonceKey, true, TimeSpan.FromSeconds(ttl));

        await next(context);
    }

    private static Task ResponderNaoAutorizado(HttpContext context, string mensagem)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        context.Response.ContentType = "application/json";
        return context.Response.WriteAsync(JsonSerializer.Serialize(new { mensagem }));
    }
}
