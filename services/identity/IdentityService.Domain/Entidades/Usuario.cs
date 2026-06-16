using IdentityService.Domain.Eventos;

namespace IdentityService.Domain.Entidades;

public class Usuario : AggregateRoot
{
    public Guid Id { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string HashSenha { get; private set; } = string.Empty;
    public string PrimeiroNome { get; private set; } = string.Empty;
    public string Sobrenome { get; private set; } = string.Empty;
    public string Perfil { get; private set; } = string.Empty;
    public bool Ativo { get; private set; }
    public DateTime CriadoEm { get; private set; }
    public DateTime AtualizadoEm { get; private set; }

    private Usuario() { }

    public Usuario(string email, string hashSenha, string primeiroNome, string sobrenome, string perfil)
    {
        Id = Guid.NewGuid();
        Email = email;
        HashSenha = hashSenha;
        PrimeiroNome = primeiroNome;
        Sobrenome = sobrenome;
        Perfil = perfil;
        Ativo = true;
        CriadoEm = DateTime.UtcNow;
        AtualizadoEm = DateTime.UtcNow;

        AdicionarEvento(new UsuarioCriadoEvent(Id, Email, Perfil, PrimeiroNome));
    }

    public void AlterarSenha(string novoHashSenha)
    {
        HashSenha = novoHashSenha;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void AlterarPerfil(string novoPerfil)
    {
        var perfilAnterior = Perfil;
        Perfil = novoPerfil;
        AtualizadoEm = DateTime.UtcNow;
        AdicionarEvento(new PerfilAlteradoEvent(Id, perfilAnterior, novoPerfil));
    }

    public void Desativar()
    {
        Ativo = false;
        AtualizadoEm = DateTime.UtcNow;
    }
}
