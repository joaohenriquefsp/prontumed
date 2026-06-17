namespace AppointmentService.Domain.Entities;

public class HorarioBloqueado
{
    public Guid Id { get; private set; }
    public Guid IdMedico { get; private set; }
    public DateTime InicioEm { get; private set; }
    public DateTime FimEm { get; private set; }
    public string? Motivo { get; private set; }
    public DateTime CriadoEm { get; private set; }

    private HorarioBloqueado() { }

    public static HorarioBloqueado Criar(Guid idMedico, DateTime inicioEm, DateTime fimEm, string? motivo)
    {
        return new HorarioBloqueado
        {
            Id = Guid.NewGuid(),
            IdMedico = idMedico,
            InicioEm = inicioEm,
            FimEm = fimEm,
            Motivo = motivo,
            CriadoEm = DateTime.UtcNow
        };
    }
}
