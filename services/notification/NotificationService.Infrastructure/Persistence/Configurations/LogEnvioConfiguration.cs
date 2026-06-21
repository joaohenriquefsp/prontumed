using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NotificationService.Domain.Entities;

namespace NotificationService.Infrastructure.Persistence.Configurations;

public class LogEnvioConfiguration : IEntityTypeConfiguration<LogEnvio>
{
    public void Configure(EntityTypeBuilder<LogEnvio> builder)
    {
        builder.ToTable("logs_envio");

        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id).HasColumnName("id");
        builder.Property(l => l.IdEvento).HasColumnName("id_evento").IsRequired();
        builder.Property(l => l.TipoEvento).HasColumnName("tipo_evento").HasMaxLength(150).IsRequired();
        builder.Property(l => l.IdDestinatario).HasColumnName("id_destinatario").IsRequired();
        builder.Property(l => l.Canal).HasColumnName("canal").HasMaxLength(20).IsRequired();
        builder.Property(l => l.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
        builder.Property(l => l.EnviadoEm).HasColumnName("enviado_em");
        builder.Property(l => l.MensagemErro).HasColumnName("mensagem_erro");
        builder.Property(l => l.CriadoEm).HasColumnName("criado_em").IsRequired();

        builder.HasIndex(l => new { l.IdEvento, l.TipoEvento, l.Canal }).IsUnique();
    }
}
