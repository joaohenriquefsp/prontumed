using MedicalRecordService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MedicalRecordService.Infrastructure.Persistence.Configurations;

public class EventoArmazenadoConfiguration : IEntityTypeConfiguration<EventoArmazenado>
{
    public void Configure(EntityTypeBuilder<EventoArmazenado> builder)
    {
        builder.ToTable("repositorio_eventos");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.IdAgregado).HasColumnName("id_agregado").IsRequired();
        builder.Property(e => e.TipoAgregado).HasColumnName("tipo_agregado").HasMaxLength(100).IsRequired();
        builder.Property(e => e.TipoEvento).HasColumnName("tipo_evento").HasMaxLength(150).IsRequired();
        builder.Property(e => e.Versao).HasColumnName("versao").IsRequired();
        builder.Property(e => e.Payload).HasColumnName("payload").HasColumnType("jsonb").IsRequired();
        builder.Property(e => e.Metadados).HasColumnName("metadados").HasColumnType("jsonb");
        builder.Property(e => e.OcorreuEm).HasColumnName("ocorreu_em").IsRequired();
        builder.HasIndex(e => new { e.IdAgregado, e.Versao }).IsUnique();
    }
}
