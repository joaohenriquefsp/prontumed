using FluentValidation;

namespace AppointmentService.Application.Commands.BloquearHorario;

public class BloquearHorarioValidator : AbstractValidator<BloquearHorarioCommand>
{
    public BloquearHorarioValidator()
    {
        RuleFor(x => x.IdMedico).NotEmpty().WithMessage("IdMedico é obrigatório.");
        RuleFor(x => x.InicioEm).NotEmpty().WithMessage("InicioEm é obrigatório.");
        RuleFor(x => x.FimEm)
            .NotEmpty().WithMessage("FimEm é obrigatório.")
            .Must((cmd, fim) => fim > cmd.InicioEm).WithMessage("FimEm deve ser posterior a InicioEm.");
        RuleFor(x => x.Motivo).MaximumLength(255).When(x => x.Motivo is not null);
    }
}
