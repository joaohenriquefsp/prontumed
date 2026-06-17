using AppointmentService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AppointmentService.Infrastructure.Persistence.Configurations;

public class HorarioBloqueadoConfiguration : IEntityTypeConfiguration<HorarioBloqueado>
{
    public void Configure(EntityTypeBuilder<HorarioBloqueado> builder)
    {
        builder.ToTable("horarios_bloqueados");
        builder.HasKey(h => h.Id);
        builder.Property(h => h.Id).HasColumnName("id");
        builder.Property(h => h.IdMedico).HasColumnName("id_medico").IsRequired();
        builder.Property(h => h.InicioEm).HasColumnName("inicio_em").IsRequired();
        builder.Property(h => h.FimEm).HasColumnName("fim_em").IsRequired();
        builder.Property(h => h.Motivo).HasColumnName("motivo").HasMaxLength(255);
        builder.Property(h => h.CriadoEm).HasColumnName("criado_em").IsRequired();
        builder.HasIndex(h => new { h.IdMedico, h.InicioEm });
    }
}
