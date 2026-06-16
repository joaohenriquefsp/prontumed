using IdentityService.Domain.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IdentityService.Infrastructure.Persistencia.Configuracoes;

public class TokenRenovacaoConfiguration : IEntityTypeConfiguration<TokenRenovacao>
{
    public void Configure(EntityTypeBuilder<TokenRenovacao> builder)
    {
        builder.ToTable("tokens_renovacao");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasColumnName("id");
        builder.Property(t => t.IdUsuario).HasColumnName("id_usuario").IsRequired();
        builder.Property(t => t.HashToken).HasColumnName("hash_token").HasMaxLength(255).IsRequired();
        builder.Property(t => t.ExpiraEm).HasColumnName("expira_em").IsRequired();
        builder.Property(t => t.RevogadoEm).HasColumnName("revogado_em");
        builder.Property(t => t.CriadoEm).HasColumnName("criado_em").IsRequired();

        builder.HasIndex(t => t.HashToken).IsUnique();
        builder.HasIndex(t => t.IdUsuario);
    }
}
