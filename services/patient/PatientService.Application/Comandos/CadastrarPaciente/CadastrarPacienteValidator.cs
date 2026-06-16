using FluentValidation;

namespace PatientService.Application.Comandos.CadastrarPaciente;

public class CadastrarPacienteValidator : AbstractValidator<CadastrarPacienteCommand>
{
    public CadastrarPacienteValidator()
    {
        RuleFor(x => x.PrimeiroNome)
            .NotEmpty().WithMessage("Primeiro nome é obrigatório.")
            .MaximumLength(100);

        RuleFor(x => x.Sobrenome)
            .NotEmpty().WithMessage("Sobrenome é obrigatório.")
            .MaximumLength(100);

        RuleFor(x => x.Cpf)
            .NotEmpty().WithMessage("CPF é obrigatório.")
            .Matches(@"^\d{11}$").WithMessage("CPF deve conter exatamente 11 dígitos numéricos.");

        RuleFor(x => x.DataNascimento)
            .NotEmpty().WithMessage("Data de nascimento é obrigatória.")
            .Must(d => d < DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Data de nascimento não pode ser futura.");

        RuleFor(x => x.Uf)
            .MaximumLength(2).When(x => x.Uf is not null)
            .WithMessage("UF deve ter no máximo 2 caracteres.");

        RuleFor(x => x.Cep)
            .Matches(@"^\d{8}$").When(x => x.Cep is not null)
            .WithMessage("CEP deve conter exatamente 8 dígitos numéricos.");
    }
}
