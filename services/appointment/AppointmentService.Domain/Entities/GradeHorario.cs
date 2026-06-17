namespace AppointmentService.Domain.Entities;

public class GradeHorario
{
    public Guid Id { get; private set; }
    public Guid IdMedico { get; private set; }
    public int DiaSemana { get; private set; }
    public TimeOnly HorarioInicio { get; private set; }
    public TimeOnly HorarioFim { get; private set; }
    public int DuracaoSlotMinutos { get; private set; }
    public bool Ativo { get; private set; }
    public DateTime CriadoEm { get; private set; }

    private GradeHorario() { }

    public static GradeHorario Criar(Guid idMedico, int diaSemana, TimeOnly horarioInicio, TimeOnly horarioFim, int duracaoSlotMinutos)
    {
        return new GradeHorario
        {
            Id = Guid.NewGuid(),
            IdMedico = idMedico,
            DiaSemana = diaSemana,
            HorarioInicio = horarioInicio,
            HorarioFim = horarioFim,
            DuracaoSlotMinutos = duracaoSlotMinutos,
            Ativo = true,
            CriadoEm = DateTime.UtcNow
        };
    }

    public void Desativar() => Ativo = false;
}
