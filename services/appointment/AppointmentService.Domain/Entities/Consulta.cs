using AppointmentService.Domain.Events;
using AppointmentService.Domain.Exceptions;

namespace AppointmentService.Domain.Entities;

public class Consulta : AggregateRoot
{
    public Guid Id { get; private set; }
    public Guid IdPaciente { get; private set; }
    public Guid IdMedico { get; private set; }
    public DateTime AgendadoPara { get; private set; }
    public int DuracaoMinutos { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string? MotivoCancelamento { get; private set; }
    public string? Observacoes { get; private set; }
    public DateTime CriadoEm { get; private set; }
    public DateTime AtualizadoEm { get; private set; }

    private Consulta() { }

    public static Consulta Criar(Guid idPaciente, Guid idMedico, DateTime agendadoPara, int duracaoMinutos = 30, string? observacoes = null)
    {
        var consulta = new Consulta
        {
            Id = Guid.NewGuid(),
            IdPaciente = idPaciente,
            IdMedico = idMedico,
            AgendadoPara = agendadoPara,
            DuracaoMinutos = duracaoMinutos,
            Status = StatusConsulta.Agendado,
            Observacoes = observacoes,
            CriadoEm = DateTime.UtcNow,
            AtualizadoEm = DateTime.UtcNow
        };
        consulta.AdicionarEvento(new ConsultaAgendadaEvent(
            consulta.Id, idPaciente, idMedico, agendadoPara, duracaoMinutos));
        return consulta;
    }

    public void Confirmar()
    {
        if (Status != StatusConsulta.Agendado)
            throw new TransicaoStatusInvalidaException(Status, StatusConsulta.Confirmado);
        Status = StatusConsulta.Confirmado;
        AtualizadoEm = DateTime.UtcNow;
        AdicionarEvento(new ConsultaConfirmadaEvent(Id, IdPaciente, IdMedico, AgendadoPara));
    }

    public void Cancelar(string? motivo)
    {
        if (Status != StatusConsulta.Agendado && Status != StatusConsulta.Confirmado)
            throw new ConsultaNaoPodeSerCanceladaException(Id, Status);
        Status = StatusConsulta.Cancelado;
        MotivoCancelamento = motivo;
        AtualizadoEm = DateTime.UtcNow;
        AdicionarEvento(new ConsultaCanceladaEvent(Id, IdPaciente, IdMedico, AgendadoPara, motivo));
    }

    public void Concluir(string? observacoes)
    {
        if (Status != StatusConsulta.Confirmado)
            throw new TransicaoStatusInvalidaException(Status, StatusConsulta.Concluido);
        Status = StatusConsulta.Concluido;
        if (observacoes is not null) Observacoes = observacoes;
        AtualizadoEm = DateTime.UtcNow;
        AdicionarEvento(new ConsultaConcluidaEvent(Id, IdPaciente, IdMedico, AgendadoPara));
    }

    public void RegistrarNoShow()
    {
        if (Status != StatusConsulta.Confirmado)
            throw new TransicaoStatusInvalidaException(Status, StatusConsulta.NoShow);
        Status = StatusConsulta.NoShow;
        AtualizadoEm = DateTime.UtcNow;
        AdicionarEvento(new ConsultaNoShowEvent(Id, IdPaciente, IdMedico, AgendadoPara));
    }
}
