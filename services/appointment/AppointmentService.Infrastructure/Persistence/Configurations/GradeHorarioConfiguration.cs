using AppointmentService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AppointmentService.Infrastructure.Persistence.Configurations;

public class GradeHorarioConfiguration : IEntityTypeConfiguration<GradeHorario>
{
    public void Configure(EntityTypeBuilder<GradeHorario> builder)
    {
        builder.ToTable("grade_horarios");
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).HasColumnName("id");
        builder.Property(g => g.IdMedico).HasColumnName("id_medico").IsRequired();
        builder.Property(g => g.DiaSemana).HasColumnName("dia_semana").IsRequired();
        builder.Property(g => g.HorarioInicio).HasColumnName("horario_inicio").IsRequired();
        builder.Property(g => g.HorarioFim).HasColumnName("horario_fim").IsRequired();
        builder.Property(g => g.DuracaoSlotMinutos).HasColumnName("duracao_slot_minutos").IsRequired();
        builder.Property(g => g.Ativo).HasColumnName("ativo").IsRequired();
        builder.Property(g => g.CriadoEm).HasColumnName("criado_em").IsRequired();
        builder.HasIndex(g => new { g.IdMedico, g.DiaSemana });
    }
}
