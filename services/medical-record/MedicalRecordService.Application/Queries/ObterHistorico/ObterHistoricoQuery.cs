using MediatR;
using MedicalRecordService.Application.DTOs;

namespace MedicalRecordService.Application.Queries.ObterHistorico;

public record ObterHistoricoQuery(Guid IdPaciente, Guid IdUsuarioAcesso) : IRequest<IReadOnlyList<EventoHistoricoDto>>;
