namespace AppointmentService.Domain.Exceptions;

public class TransicaoStatusInvalidaException(string statusAtual, string statusDesejado)
    : Exception($"Não é possível transitar de '{statusAtual}' para '{statusDesejado}'.");
