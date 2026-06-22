using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;

namespace NotificationService.Infrastructure.Http;

public class MedicoServiceClient(HttpClient httpClient) : IMedicoServiceClient
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public async Task<MedicoDto?> ObterPorIdAsync(Guid id, CancellationToken ct = default)
    {
        var resposta = await httpClient.GetAsync($"/usuarios/{id}/interno", ct);
        if (resposta.StatusCode == HttpStatusCode.NotFound)
            return null;

        resposta.EnsureSuccessStatusCode();
        return await resposta.Content.ReadFromJsonAsync<MedicoDto>(JsonOptions, ct);
    }
}
