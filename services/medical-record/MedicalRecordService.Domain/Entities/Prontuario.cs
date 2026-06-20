using MedicalRecordService.Domain.Events;
using MedicalRecordService.Domain.Exceptions;

namespace MedicalRecordService.Domain.Entities;

public class Prontuario : AggregateRoot
{
    public Guid Id { get; private set; }
    public Guid IdPaciente { get; private set; }
    public DateTime CriadoEm { get; private set; }

    private readonly List<EntradaProntuario> _entradas = [];
    public IReadOnlyCollection<EntradaProntuario> Entradas => _entradas.AsReadOnly();

    private Prontuario() { }

    // Lado de comando: cria o agregado e levanta um evento NOVO (vai para outbox + event store).
    public static Prontuario Criar(Guid idPaciente, Guid idMedicoCriador)
    {
        var prontuario = new Prontuario
        {
            Id = idPaciente,
            IdPaciente = idPaciente,
            CriadoEm = DateTime.UtcNow
        };
        prontuario.AdicionarEvento(new RecordCreatedEvent(idPaciente, idMedicoCriador, prontuario.CriadoEm));
        return prontuario;
    }

    // Lado de comando: valida e levanta um evento NOVO.
    public void AdicionarEntrada(Guid idMedico, string tipoEntrada, string conteudo)
    {
        if (!TipoEntradaProntuario.EhValido(tipoEntrada))
            throw new TipoEntradaInvalidaException(tipoEntrada);

        var idEntrada = Guid.NewGuid();
        var ocorreuEm = DateTime.UtcNow;
        _entradas.Add(new EntradaProntuario(idEntrada, idMedico, tipoEntrada, conteudo, ocorreuEm));

        AdicionarEvento(tipoEntrada switch
        {
            TipoEntradaProntuario.NotaConsulta => new ConsultationNoteAddedEvent(Id, idEntrada, idMedico, conteudo, ocorreuEm),
            TipoEntradaProntuario.Diagnostico => new DiagnosisAddedEvent(Id, idEntrada, idMedico, conteudo, ocorreuEm),
            TipoEntradaProntuario.Prescricao => new PrescriptionAddedEvent(Id, idEntrada, idMedico, conteudo, ocorreuEm),
            TipoEntradaProntuario.Exame => new ExamRequestedEvent(Id, idEntrada, idMedico, conteudo, ocorreuEm),
            _ => throw new TipoEntradaInvalidaException(tipoEntrada)
        });
    }

    // Lado de leitura: reconstrói o estado a partir do histórico, sem levantar eventos novos.
    public static Prontuario ReplayEventos(Guid idAgregado, IEnumerable<EventoArmazenado> historico)
    {
        var prontuario = new Prontuario { Id = idAgregado, IdPaciente = idAgregado };
        foreach (var armazenado in historico.OrderBy(e => e.Versao))
            prontuario.Aplicar(EventoArmazenadoSerializer.Desserializar(armazenado));
        return prontuario;
    }

    private void Aplicar(IDomainEvent evento)
    {
        switch (evento)
        {
            case RecordCreatedEvent e:
                CriadoEm = e.CriadoEm;
                break;
            case ConsultationNoteAddedEvent e:
                _entradas.Add(new EntradaProntuario(e.IdEntrada, e.IdMedico, TipoEntradaProntuario.NotaConsulta, e.Conteudo, e.OcorreuEm));
                break;
            case DiagnosisAddedEvent e:
                _entradas.Add(new EntradaProntuario(e.IdEntrada, e.IdMedico, TipoEntradaProntuario.Diagnostico, e.Conteudo, e.OcorreuEm));
                break;
            case PrescriptionAddedEvent e:
                _entradas.Add(new EntradaProntuario(e.IdEntrada, e.IdMedico, TipoEntradaProntuario.Prescricao, e.Conteudo, e.OcorreuEm));
                break;
            case ExamRequestedEvent e:
                _entradas.Add(new EntradaProntuario(e.IdEntrada, e.IdMedico, TipoEntradaProntuario.Exame, e.Conteudo, e.OcorreuEm));
                break;
        }
    }
}
