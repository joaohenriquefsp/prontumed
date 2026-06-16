using MediatR;
using PatientService.Application.DTOs;

namespace PatientService.Application.Consultas.ObterPacientePorCpf;

public record ObterPacientePorCpfQuery(string Cpf) : IRequest<PacienteDto>;
