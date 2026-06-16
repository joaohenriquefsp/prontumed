using FluentValidation;

namespace IdentityService.Application.Commands.CriarUsuario;

public class CriarUsuarioCommandValidator : AbstractValidator<CriarUsuarioCommand>
{
    private static readonly string[] PerfisValidos = ["Patient", "Doctor", "Receptionist", "Admin"];

    public CriarUsuarioCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-mail obrigatório.")
            .EmailAddress().WithMessage("E-mail em formato inválido.");

        RuleFor(x => x.Senha)
            .NotEmpty().WithMessage("Senha obrigatória.")
            .MinimumLength(8).WithMessage("Senha deve ter no mínimo 8 caracteres.");

        RuleFor(x => x.PrimeiroNome)
            .NotEmpty().WithMessage("Primeiro nome obrigatório.")
            .MaximumLength(100);

        RuleFor(x => x.Sobrenome)
            .NotEmpty().WithMessage("Sobrenome obrigatório.")
            .MaximumLength(100);

        RuleFor(x => x.Perfil)
            .NotEmpty().WithMessage("Perfil obrigatório.")
            .Must(p => PerfisValidos.Contains(p))
            .WithMessage($"Perfil inválido. Valores aceitos: {string.Join(", ", PerfisValidos)}.");
    }
}
