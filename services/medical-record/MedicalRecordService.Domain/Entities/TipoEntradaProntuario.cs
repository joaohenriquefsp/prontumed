namespace MedicalRecordService.Domain.Entities;

public static class TipoEntradaProntuario
{
    public const string NotaConsulta = "NotaConsulta";
    public const string Diagnostico = "Diagnostico";
    public const string Prescricao = "Prescricao";
    public const string Exame = "Exame";

    private static readonly HashSet<string> Validos = [NotaConsulta, Diagnostico, Prescricao, Exame];

    public static bool EhValido(string tipo) => Validos.Contains(tipo);
}
