namespace AppointmentService.Domain.Entities;

public static class EtapaSaga
{
    public const string ConsultaAgendada = "ConsultaAgendada";
    public const string ConsultaConfirmada = "ConsultaConfirmada";
    public const string ConsultaCancelada = "ConsultaCancelada";
    public const string ConsultaConcluida = "ConsultaConcluida";
    public const string NoShowRegistrado = "NoShowRegistrado";

    private static readonly HashSet<string> _validos =
    [
        ConsultaAgendada, ConsultaConfirmada, ConsultaCancelada,
        ConsultaConcluida, NoShowRegistrado
    ];

    public static bool EhValido(string etapa) => _validos.Contains(etapa);
}
