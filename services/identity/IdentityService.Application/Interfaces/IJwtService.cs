using IdentityService.Domain.Entities;

namespace IdentityService.Application.Interfaces;

public interface IJwtService
{
    string GerarAccessToken(Usuario usuario);
    string GerarRefreshToken();
}
