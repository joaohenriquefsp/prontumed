namespace AppointmentService.Domain.Exceptions;
public class GradeHorarioNaoEncontradaException(string mensagem = "Grade de horário não encontrada.") : Exception(mensagem);
