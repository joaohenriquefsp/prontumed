using FluentValidation;

namespace AppointmentService.Application.Commands.CancelarConsulta;

public class CancelarConsultaValidator : AbstractValidator<CancelarConsultaCommand>
{
    public CancelarConsultaValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id da consulta é obrigatório.");
        RuleFor(x => x.Motivo)
            .MaximumLength(500).When(x => x.Motivo is not null)
            .WithMessage("Motivo deve ter no máximo 500 caracteres.");
    }
}
