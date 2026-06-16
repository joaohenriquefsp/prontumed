using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PatientService.Infrastructure.Outbox;

namespace PatientService.Infrastructure.Persistence.Configurations;

public class EventoSaidaConfiguration : IEntityTypeConfiguration<EventoSaida>
{
    public void Configure(EntityTypeBuilder<EventoSaida> builder)
    {
        builder.ToTable("eventos_saida");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.TipoAgregado).HasColumnName("tipo_agregado").HasMaxLength(100).IsRequired();
        builder.Property(e => e.IdAgregado).HasColumnName("id_agregado").IsRequired();
        builder.Property(e => e.TipoEvento).HasColumnName("tipo_evento").HasMaxLength(150).IsRequired();
        builder.Property(e => e.Payload).HasColumnName("payload").HasColumnType("jsonb").IsRequired();
        builder.Property(e => e.CriadoEm).HasColumnName("criado_em").IsRequired();
    }
}
