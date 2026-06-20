using MediatR;
using MedicalRecordService.Application.DTOs;

namespace MedicalRecordService.Application.Queries.ObterProntuario;

public record ObterProntuarioQuery(Guid IdPaciente, Guid IdUsuarioAcesso) : IRequest<ProntuarioDto>;
