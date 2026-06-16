using IdentityService.Domain.Entities;
using IdentityService.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.Infrastructure.Persistence.Repositories;

public class TokenRenovacaoRepository(AppDbContext context) : ITokenRenovacaoRepository
{
    public async Task<TokenRenovacao?> ObterPorHashAsync(string hashToken, CancellationToken ct = default)
        => await context.TokensRenovacao.FirstOrDefaultAsync(t => t.HashToken == hashToken, ct);

    public async Task AdicionarAsync(TokenRenovacao token, CancellationToken ct = default)
    {
        await context.TokensRenovacao.AddAsync(token, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task AtualizarAsync(TokenRenovacao token, CancellationToken ct = default)
    {
        context.TokensRenovacao.Update(token);
        await context.SaveChangesAsync(ct);
    }

    public async Task RevogarTodosDoUsuarioAsync(Guid idUsuario, CancellationToken ct = default)
    {
        var tokens = await context.TokensRenovacao
            .Where(t => t.IdUsuario == idUsuario && t.RevogadoEm == null)
            .ToListAsync(ct);

        foreach (var token in tokens)
            token.Revogar();

        await context.SaveChangesAsync(ct);
    }
}
