using MediatR;

namespace IdentityService.Application.Commands.Logout;

public record LogoutCommand(string RefreshToken) : IRequest;
