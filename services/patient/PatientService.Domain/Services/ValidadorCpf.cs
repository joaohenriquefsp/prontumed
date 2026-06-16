namespace PatientService.Domain.Services;

public static class ValidadorCpf
{
    public static bool Valido(string cpf)
    {
        var digitos = cpf.Where(char.IsDigit).ToArray();

        if (digitos.Length != 11) return false;
        if (digitos.Distinct().Count() == 1) return false;

        return VerificarDigito(digitos, 9) && VerificarDigito(digitos, 10);
    }

    private static bool VerificarDigito(char[] digitos, int posicao)
    {
        var soma = 0;
        for (var i = 0; i < posicao; i++)
            soma += (digitos[i] - '0') * (posicao + 1 - i);

        var resto = (soma * 10) % 11;
        if (resto == 10) resto = 0;

        return resto == (digitos[posicao] - '0');
    }

    public static string ApenasDigitos(string cpf) =>
        new(cpf.Where(char.IsDigit).ToArray());
}
