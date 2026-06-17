namespace AppointmentService.Domain.Exceptions;
public class HorarioBloqueadoNaoEncontradoException(string mensagem = "Horário bloqueado não encontrado.") : Exception(mensagem);
