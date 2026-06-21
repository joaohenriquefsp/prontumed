using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NotificationService.Domain.Entities;

namespace NotificationService.Infrastructure.Persistence.Configurations;

public class ModeloNotificacaoConfiguration : IEntityTypeConfiguration<ModeloNotificacao>
{
    public void Configure(EntityTypeBuilder<ModeloNotificacao> builder)
    {
        builder.ToTable("modelos_notificacao");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasColumnName("id");
        builder.Property(m => m.TipoEvento).HasColumnName("tipo_evento").HasMaxLength(150).IsRequired();
        builder.Property(m => m.Canal).HasColumnName("canal").HasMaxLength(20).IsRequired();
        builder.Property(m => m.Assunto).HasColumnName("assunto").HasMaxLength(255);
        builder.Property(m => m.CorpoModelo).HasColumnName("corpo_modelo").IsRequired();
        builder.Property(m => m.Ativo).HasColumnName("ativo").IsRequired();

        builder.HasIndex(m => new { m.TipoEvento, m.Canal }).IsUnique();
    }
}
