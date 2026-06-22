namespace NotificationService.Domain.Entities;

public class ModeloNotificacao
{
    public Guid Id { get; private set; }
    public string TipoEvento { get; private set; } = string.Empty;
    public string Canal { get; private set; } = string.Empty;
    public string? Assunto { get; private set; }
    public string CorpoModelo { get; private set; } = string.Empty;
    public bool Ativo { get; private set; }

    private ModeloNotificacao() { }

    public string RenderizarCorpo(IReadOnlyDictionary<string, string> variaveis) =>
        Renderizar(CorpoModelo, variaveis);

    public string? RenderizarAssunto(IReadOnlyDictionary<string, string> variaveis) =>
        Assunto is null ? null : Renderizar(Assunto, variaveis);

    private static string Renderizar(string template, IReadOnlyDictionary<string, string> variaveis)
    {
        var resultado = template;
        foreach (var (chave, valor) in variaveis)
            resultado = resultado.Replace($"{{{{{chave}}}}}", valor);
        return resultado;
    }
}
