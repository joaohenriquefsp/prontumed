using IdentityService.Application.DTOs;
using MediatR;

namespace IdentityService.Application.Comandos.RenovarToken;

public record RenovarTokenCommand(string RefreshToken) : IRequest<TokenDto>;
