using FluentValidation;

namespace IdentityService.Application.Commands.AlterarSenha;

public class AlterarSenhaCommandValidator : AbstractValidator<AlterarSenhaCommand>
{
    public AlterarSenhaCommandValidator()
    {
        RuleFor(x => x.SenhaAtual).NotEmpty().WithMessage("Senha atual obrigatória.");
        RuleFor(x => x.NovaSenha)
            .NotEmpty().WithMessage("Nova senha obrigatória.")
            .MinimumLength(8).WithMessage("Nova senha deve ter no mínimo 8 caracteres.");
    }
}
