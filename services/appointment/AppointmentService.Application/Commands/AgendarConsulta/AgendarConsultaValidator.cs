using FluentValidation;

namespace AppointmentService.Application.Commands.AgendarConsulta;

public class AgendarConsultaValidator : AbstractValidator<AgendarConsultaCommand>
{
    public AgendarConsultaValidator()
    {
        RuleFor(x => x.IdPaciente).NotEmpty().WithMessage("IdPaciente é obrigatório.");
        RuleFor(x => x.IdMedico).NotEmpty().WithMessage("IdMedico é obrigatório.");
        RuleFor(x => x.AgendadoPara)
            .NotEmpty().WithMessage("Data/hora do agendamento é obrigatória.")
            .Must(d => d > DateTime.UtcNow).WithMessage("O agendamento deve ser para uma data futura.");
        RuleFor(x => x.DuracaoMinutos)
            .InclusiveBetween(15, 120).WithMessage("A duração deve ser entre 15 e 120 minutos.");
    }
}
