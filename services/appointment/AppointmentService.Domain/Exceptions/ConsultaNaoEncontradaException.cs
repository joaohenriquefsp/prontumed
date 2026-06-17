namespace AppointmentService.Domain.Exceptions;

public class ConsultaNaoEncontradaException(string mensagem = "Consulta não encontrada.") : Exception(mensagem);
