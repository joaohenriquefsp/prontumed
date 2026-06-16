using IdentityService.Domain.Entidades;

namespace IdentityService.Domain.Repositorios;

public interface ITokenRenovacaoRepository
{
    Task<TokenRenovacao?> ObterPorHashAsync(string hashToken, CancellationToken ct = default);
    Task AdicionarAsync(TokenRenovacao token, CancellationToken ct = default);
    Task AtualizarAsync(TokenRenovacao token, CancellationToken ct = default);
    Task RevogarTodosDoUsuarioAsync(Guid idUsuario, CancellationToken ct = default);
}
