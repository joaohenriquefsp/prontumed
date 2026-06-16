namespace IdentityService.Application.Interfaces;

public interface IHashService
{
    string Gerar(string valor);
    bool Verificar(string valor, string hash);
}
