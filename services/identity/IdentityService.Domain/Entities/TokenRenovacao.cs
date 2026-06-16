namespace IdentityService.Domain.Entities;

public class TokenRenovacao
{
    public Guid Id { get; private set; }
    public Guid IdUsuario { get; private set; }
    public string HashToken { get; private set; } = string.Empty;
    public DateTime ExpiraEm { get; private set; }
    public DateTime? RevogadoEm { get; private set; }
    public DateTime CriadoEm { get; private set; }

    private TokenRenovacao() { }

    public TokenRenovacao(Guid idUsuario, string hashToken, DateTime expiraEm)
    {
        Id = Guid.NewGuid();
        IdUsuario = idUsuario;
        HashToken = hashToken;
        ExpiraEm = expiraEm;
        CriadoEm = DateTime.UtcNow;
    }

    public bool EstaValido() => RevogadoEm is null && ExpiraEm > DateTime.UtcNow;

    public void Revogar() => RevogadoEm = DateTime.UtcNow;
}
