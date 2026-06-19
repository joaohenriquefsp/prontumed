using AppointmentService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AppointmentService.Infrastructure.Persistence.Configurations;

public class ConsultaConfiguration : IEntityTypeConfiguration<Consulta>
{
    public void Configure(EntityTypeBuilder<Consulta> builder)
    {
        builder.ToTable("consultas");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id");
        builder.Property(c => c.IdPaciente).HasColumnName("id_paciente").IsRequired();
        builder.Property(c => c.IdMedico).HasColumnName("id_medico").IsRequired();
        builder.Property(c => c.AgendadoPara).HasColumnName("agendado_para").IsRequired();
        builder.Property(c => c.DuracaoMinutos).HasColumnName("duracao_minutos").IsRequired();
        builder.Property(c => c.Status).HasColumnName("status").HasMaxLength(30).IsRequired();
        builder.Property(c => c.MotivoCancelamento).HasColumnName("motivo_cancelamento").HasMaxLength(500);
        builder.Property(c => c.Observacoes).HasColumnName("observacoes");
        builder.Property(c => c.CriadoEm).HasColumnName("criado_em").IsRequired();
        builder.Property(c => c.AtualizadoEm).HasColumnName("atualizado_em").IsRequired();
        builder.HasIndex(c => new { c.IdMedico, c.AgendadoPara })
            .IsUnique()
            .HasFilter("status NOT IN ('Cancelled', 'Completed', 'NoShow')")
            .HasDatabaseName("idx_consultas_slot_unico");
        builder.HasIndex(c => c.IdPaciente);
        builder.Ignore(c => c.Eventos);
    }
}
