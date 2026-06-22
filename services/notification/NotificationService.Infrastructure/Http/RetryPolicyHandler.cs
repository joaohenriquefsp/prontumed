using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;

namespace NotificationService.Infrastructure.Http;

// Retry com backoff exponencial para falhas transitórias ao chamar
// Patient/Identity Service — protege contra indisponibilidade momentânea
// sem precisar de um read model local (ver decisão registrada na conversa).
public class RetryPolicyHandler(ILogger<RetryPolicyHandler> logger) : DelegatingHandler
{
    private readonly ResiliencePipeline<HttpResponseMessage> _pipeline = new ResiliencePipelineBuilder<HttpResponseMessage>()
        .AddRetry(new RetryStrategyOptions<HttpResponseMessage>
        {
            ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
                .Handle<HttpRequestException>()
                .Handle<TaskCanceledException>()
                .HandleResult(r => (int)r.StatusCode >= 500),
            MaxRetryAttempts = 3,
            BackoffType = DelayBackoffType.Exponential,
            Delay = TimeSpan.FromSeconds(1),
            OnRetry = args =>
            {
                logger.LogWarning(
                    "Tentativa {Tentativa} falhou, tentando novamente em {Delay}",
                    args.AttemptNumber + 1, args.RetryDelay);
                return ValueTask.CompletedTask;
            },
        })
        .Build();

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
        _pipeline.ExecuteAsync(async ct =>
        {
            var resposta = await base.SendAsync(request, ct);
            return resposta;
        }, cancellationToken).AsTask();
}
