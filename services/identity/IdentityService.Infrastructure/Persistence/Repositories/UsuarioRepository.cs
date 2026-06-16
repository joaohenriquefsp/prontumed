using IdentityService.Domain.Entities;
using IdentityService.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.Infrastructure.Persistence.Repositories;

public class UsuarioRepository(AppDbContext context) : IUsuarioRepository
{
    public async Task<Usuario?> ObterPorIdAsync(Guid id, CancellationToken ct = default)
        => await context.Usuarios.FirstOrDefaultAsync(u => u.Id == id, ct);

    public async Task<Usuario?> ObterPorEmailAsync(string email, CancellationToken ct = default)
        => await context.Usuarios.FirstOrDefaultAsync(u => u.Email == email, ct);

    public async Task<IEnumerable<Usuario>> ListarAsync(int pagina, int tamanhoPagina, CancellationToken ct = default)
        => await context.Usuarios
            .OrderBy(u => u.PrimeiroNome)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToListAsync(ct);

    public async Task<bool> EmailExisteAsync(string email, CancellationToken ct = default)
        => await context.Usuarios.AnyAsync(u => u.Email == email, ct);

    public async Task AdicionarAsync(Usuario usuario, CancellationToken ct = default)
    {
        await context.Usuarios.AddAsync(usuario, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task AtualizarAsync(Usuario usuario, CancellationToken ct = default)
    {
        context.Usuarios.Update(usuario);
        await context.SaveChangesAsync(ct);
    }
}
