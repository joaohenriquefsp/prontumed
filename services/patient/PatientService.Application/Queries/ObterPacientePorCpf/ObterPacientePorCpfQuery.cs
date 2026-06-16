using MediatR;
using PatientService.Application.DTOs;

namespace PatientService.Application.Queries.ObterPacientePorCpf;

public record ObterPacientePorCpfQuery(string Cpf) : IRequest<PacienteDto>;
