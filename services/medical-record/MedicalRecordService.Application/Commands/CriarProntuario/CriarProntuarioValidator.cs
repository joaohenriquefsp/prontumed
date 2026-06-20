using FluentValidation;

namespace MedicalRecordService.Application.Commands.CriarProntuario;

public class CriarProntuarioValidator : AbstractValidator<CriarProntuarioCommand>
{
    public CriarProntuarioValidator()
    {
        RuleFor(x => x.IdPaciente).NotEmpty().WithMessage("IdPaciente é obrigatório.");
        RuleFor(x => x.IdMedicoCriador).NotEmpty().WithMessage("IdMedicoCriador é obrigatório.");
    }
}
