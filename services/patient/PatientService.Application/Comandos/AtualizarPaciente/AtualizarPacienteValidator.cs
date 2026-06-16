using FluentValidation;

namespace PatientService.Application.Comandos.AtualizarPaciente;

public class AtualizarPacienteValidator : AbstractValidator<AtualizarPacienteCommand>
{
    public AtualizarPacienteValidator()
    {
        RuleFor(x => x.Id).NotEmpty();

        RuleFor(x => x.PrimeiroNome)
            .NotEmpty().WithMessage("Primeiro nome é obrigatório.")
            .MaximumLength(100);

        RuleFor(x => x.Sobrenome)
            .NotEmpty().WithMessage("Sobrenome é obrigatório.")
            .MaximumLength(100);

        RuleFor(x => x.DataNascimento)
            .NotEmpty()
            .Must(d => d < DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Data de nascimento não pode ser futura.");

        RuleFor(x => x.Uf)
            .MaximumLength(2).When(x => x.Uf is not null);

        RuleFor(x => x.Cep)
            .Matches(@"^\d{8}$").When(x => x.Cep is not null)
            .WithMessage("CEP deve conter exatamente 8 dígitos numéricos.");
    }
}
