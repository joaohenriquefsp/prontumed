namespace AppointmentService.Domain.Entities;

public static class StatusSaga
{
    public const string EmAndamento = "EmAndamento";
    public const string Concluido = "Concluido";
    public const string Falhou = "Falhou";
    public const string Compensando = "Compensando";

    private static readonly HashSet<string> _validos =
        [EmAndamento, Concluido, Falhou, Compensando];

    public static bool EhValido(string status) => _validos.Contains(status);
}
