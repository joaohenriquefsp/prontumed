using MediatR;
using PatientService.Application.DTOs;

namespace PatientService.Application.Queries.ObterPacientePorId;

public record ObterPacientePorIdQuery(Guid Id) : IRequest<PacienteDto>;
