using MediatR;
using PatientService.Application.DTOs;

namespace PatientService.Application.Consultas.ObterPacientePorId;

public record ObterPacientePorIdQuery(Guid Id) : IRequest<PacienteDto>;
