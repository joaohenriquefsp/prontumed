using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;

namespace NotificationService.Infrastructure.Http;

public class PacienteServiceClient(HttpClient httpClient) : IPacienteServiceClient
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public async Task<PacienteDto?> ObterPorIdAsync(Guid id, CancellationToken ct = default)
    {
        var resposta = await httpClient.GetAsync($"/pacientes/{id}/interno", ct);
        if (resposta.StatusCode == HttpStatusCode.NotFound)
            return null;

        resposta.EnsureSuccessStatusCode();
        return await resposta.Content.ReadFromJsonAsync<PacienteDto>(JsonOptions, ct);
    }
}
