using IdentityService.Application.DTOs;
using MediatR;

namespace IdentityService.Application.Commands.Login;

public record LoginCommand(
    string Email,
    string Senha
) : IRequest<TokenDto>;
