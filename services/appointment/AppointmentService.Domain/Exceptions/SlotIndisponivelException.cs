namespace AppointmentService.Domain.Exceptions;
public class SlotIndisponivelException(DateTime agendadoPara)
    : Exception($"O horário {agendadoPara:dd/MM/yyyy HH:mm} não está disponível.");
