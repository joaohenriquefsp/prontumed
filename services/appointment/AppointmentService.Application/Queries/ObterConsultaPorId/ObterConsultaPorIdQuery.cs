using MediatR;
using AppointmentService.Application.DTOs;

namespace AppointmentService.Application.Queries.ObterConsultaPorId;

public record ObterConsultaPorIdQuery(Guid Id) : IRequest<ConsultaDto>;
