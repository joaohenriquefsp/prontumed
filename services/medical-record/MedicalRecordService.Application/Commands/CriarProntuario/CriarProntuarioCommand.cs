using MediatR;

namespace MedicalRecordService.Application.Commands.CriarProntuario;

public record CriarProntuarioCommand(Guid IdPaciente, Guid IdMedicoCriador) : IRequest<Unit>;
