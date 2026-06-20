using MediatR;
using MedicalRecordService.Application.DTOs;

namespace MedicalRecordService.Application.Queries.ObterEntrada;

public record ObterEntradaQuery(Guid IdPaciente, Guid IdEntrada, Guid IdUsuarioAcesso) : IRequest<EntradaDto>;
