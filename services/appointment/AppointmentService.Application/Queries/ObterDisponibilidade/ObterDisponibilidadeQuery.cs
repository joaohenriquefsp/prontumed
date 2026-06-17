using MediatR;
using AppointmentService.Application.DTOs;

namespace AppointmentService.Application.Queries.ObterDisponibilidade;

public record ObterDisponibilidadeQuery(Guid IdMedico, DateOnly Data) : IRequest<ObterDisponibilidadeResult>;

public record ObterDisponibilidadeResult(IEnumerable<SlotDisponibilidadeDto> Slots);
