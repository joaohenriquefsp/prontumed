namespace IdentityService.Application.DTOs;

public record TokenDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiraEm
);
