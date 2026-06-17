namespace AppointmentService.Domain.Exceptions;

public class ConsultaNaoPodeSerCanceladaException(Guid id, string statusAtual)
    : Exception($"A consulta '{id}' não pode ser cancelada pois está com status '{statusAtual}'.");
