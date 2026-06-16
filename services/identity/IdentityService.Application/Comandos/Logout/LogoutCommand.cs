using MediatR;

namespace IdentityService.Application.Comandos.Logout;

public record LogoutCommand(string RefreshToken) : IRequest;
