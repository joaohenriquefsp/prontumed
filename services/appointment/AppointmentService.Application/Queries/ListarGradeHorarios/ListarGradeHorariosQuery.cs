using MediatR;
using AppointmentService.Application.DTOs;

namespace AppointmentService.Application.Queries.ListarGradeHorarios;

public record ListarGradeHorariosQuery(Guid IdMedico) : IRequest<IEnumerable<GradeHorarioDto>>;
