using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;

namespace NotificationService.Infrastructure.Http;

// Assina cada chamada feita pelo Notification Service a outros serviços
// internos, igual ao que o BFF faz hoje — é essa assinatura que dá acesso
// aos endpoints /interno do Identity e do Patient Service.
public class HmacSigningHandler(IOptions<HmacOptions> options) : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        var path = request.RequestUri!.AbsolutePath;
        var queryString = request.RequestUri.Query;
        var mensagem = $"{request.Method.Method}{path}{queryString}{timestamp}";
        var assinatura = GerarHmac(mensagem, options.Value.Chave);

        request.Headers.Add("X-HMAC-Signature", assinatura);
        request.Headers.Add("X-HMAC-Timestamp", timestamp);

        return await base.SendAsync(request, cancellationToken);
    }

    private static string GerarHmac(string mensagem, string chave)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(chave));
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(mensagem))).ToLowerInvariant();
    }
}
