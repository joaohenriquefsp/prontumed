using IdentityService.Application.DTOs;
using MediatR;

namespace IdentityService.Application.Commands.RenovarToken;

public record RenovarTokenCommand(string RefreshToken) : IRequest<TokenDto>;
