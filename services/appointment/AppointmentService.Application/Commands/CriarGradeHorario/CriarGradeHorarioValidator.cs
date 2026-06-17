using FluentValidation;

namespace AppointmentService.Application.Commands.CriarGradeHorario;

public class CriarGradeHorarioValidator : AbstractValidator<CriarGradeHorarioCommand>
{
    public CriarGradeHorarioValidator()
    {
        RuleFor(x => x.IdMedico).NotEmpty().WithMessage("IdMedico é obrigatório.");
        RuleFor(x => x.DiaSemana).InclusiveBetween(0, 6).WithMessage("DiaSemana deve ser entre 0 (Domingo) e 6 (Sábado).");
        RuleFor(x => x.HorarioFim).Must((cmd, fim) => fim > cmd.HorarioInicio)
            .WithMessage("HorarioFim deve ser posterior a HorarioInicio.");
        RuleFor(x => x.DuracaoSlotMinutos).InclusiveBetween(15, 120)
            .WithMessage("DuracaoSlotMinutos deve ser entre 15 e 120 minutos.");
    }
}
