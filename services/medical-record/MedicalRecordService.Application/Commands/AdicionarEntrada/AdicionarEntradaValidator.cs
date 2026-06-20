using FluentValidation;
using MedicalRecordService.Domain.Entities;

namespace MedicalRecordService.Application.Commands.AdicionarEntrada;

public class AdicionarEntradaValidator : AbstractValidator<AdicionarEntradaCommand>
{
    public AdicionarEntradaValidator()
    {
        RuleFor(x => x.IdPaciente).NotEmpty().WithMessage("IdPaciente é obrigatório.");
        RuleFor(x => x.IdMedico).NotEmpty().WithMessage("IdMedico é obrigatório.");
        RuleFor(x => x.TipoEntrada)
            .NotEmpty().WithMessage("TipoEntrada é obrigatório.")
            .Must(TipoEntradaProntuario.EhValido).WithMessage("TipoEntrada inválido.");
        RuleFor(x => x.Conteudo).NotEmpty().WithMessage("Conteudo é obrigatório.");
    }
}
