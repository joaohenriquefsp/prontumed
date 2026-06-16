using IdentityService.Application.Interfaces;

namespace IdentityService.Infrastructure.Services;

public class BcryptHashService : IHashService
{
    public string Gerar(string valor) => BCrypt.Net.BCrypt.HashPassword(valor);

    public bool Verificar(string valor, string hash) => BCrypt.Net.BCrypt.Verify(valor, hash);
}
