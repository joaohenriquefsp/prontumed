using MediatR;

namespace MedicalRecordService.Application.Commands.AdicionarEntrada;

public record AdicionarEntradaCommand(Guid IdPaciente, Guid IdMedico, string TipoEntrada, string Conteudo) : IRequest<Guid>;
