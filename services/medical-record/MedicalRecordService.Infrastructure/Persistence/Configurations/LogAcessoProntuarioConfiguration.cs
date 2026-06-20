using MedicalRecordService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MedicalRecordService.Infrastructure.Persistence.Configurations;

public class LogAcessoProntuarioConfiguration : IEntityTypeConfiguration<LogAcessoProntuario>
{
    public void Configure(EntityTypeBuilder<LogAcessoProntuario> builder)
    {
        builder.ToTable("log_acesso_prontuario");
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id).HasColumnName("id");
        builder.Property(l => l.IdProntuario).HasColumnName("id_prontuario").IsRequired();
        builder.Property(l => l.IdUsuarioAcesso).HasColumnName("id_usuario_acesso").IsRequired();
        builder.Property(l => l.AcessadoEm).HasColumnName("acessado_em").IsRequired();
        builder.Property(l => l.Acao).HasColumnName("acao").HasMaxLength(50).IsRequired();
    }
}
