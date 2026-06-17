using AppointmentService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AppointmentService.Infrastructure.Persistence.Configurations;

public class EstadoSagaConfiguration : IEntityTypeConfiguration<EstadoSaga>
{
    public void Configure(EntityTypeBuilder<EstadoSaga> builder)
    {
        builder.ToTable("estado_saga");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.IdCorrelacao).HasColumnName("id_correlacao").IsRequired();
        builder.Property(e => e.TipoSaga).HasColumnName("tipo_saga").HasMaxLength(100).IsRequired();
        builder.Property(e => e.EtapaAtual).HasColumnName("etapa_atual").HasMaxLength(100).IsRequired();
        builder.Property(e => e.Status).HasColumnName("status").HasMaxLength(30).IsRequired();
        builder.Property(e => e.Payload).HasColumnName("payload").HasColumnType("jsonb").IsRequired();
        builder.Property(e => e.CriadoEm).HasColumnName("criado_em").IsRequired();
        builder.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em").IsRequired();
        builder.HasIndex(e => e.IdCorrelacao).IsUnique();
    }
}
