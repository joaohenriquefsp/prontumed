namespace MedicalRecordService.Domain.Entities;

public static class AcaoAcessoProntuario
{
    public const string Viewed = "Viewed";
    public const string Exported = "Exported";
    public const string Printed = "Printed";

    private static readonly HashSet<string> Validos = [Viewed, Exported, Printed];

    public static bool EhValido(string acao) => Validos.Contains(acao);
}
