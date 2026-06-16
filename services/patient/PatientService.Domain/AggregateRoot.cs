namespace PatientService.Domain;

public abstract class AggregateRoot
{
    private readonly List<IDomainEvent> _eventos = [];

    public IReadOnlyCollection<IDomainEvent> Eventos => _eventos.AsReadOnly();

    protected void AdicionarEvento(IDomainEvent evento) => _eventos.Add(evento);

    public void LimparEventos() => _eventos.Clear();
}
