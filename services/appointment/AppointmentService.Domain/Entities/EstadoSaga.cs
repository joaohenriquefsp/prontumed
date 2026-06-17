namespace AppointmentService.Domain.Entities;

public class EstadoSaga
{
    public Guid Id { get; private set; }
    public Guid IdCorrelacao { get; private set; }
    public string TipoSaga { get; private set; } = string.Empty;
    public string EtapaAtual { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public string Payload { get; private set; } = string.Empty;
    public DateTime CriadoEm { get; private set; }
    public DateTime AtualizadoEm { get; private set; }

    private EstadoSaga() { }

    public static EstadoSaga Criar(Guid idCorrelacao, string tipoSaga, string etapaInicial, string payload)
    {
        return new EstadoSaga
        {
            Id = Guid.NewGuid(),
            IdCorrelacao = idCorrelacao,
            TipoSaga = tipoSaga,
            EtapaAtual = etapaInicial,
            Status = StatusSaga.EmAndamento,
            Payload = payload,
            CriadoEm = DateTime.UtcNow,
            AtualizadoEm = DateTime.UtcNow
        };
    }

    public void AtualizarEtapa(string etapa, string status, string payload)
    {
        EtapaAtual = etapa;
        Status = status;
        Payload = payload;
        AtualizadoEm = DateTime.UtcNow;
    }
}
