using IdentityService.Domain.Entidades;

namespace IdentityService.Application.Interfaces;

public interface IJwtService
{
    string GerarAccessToken(Usuario usuario);
    string GerarRefreshToken();
}
