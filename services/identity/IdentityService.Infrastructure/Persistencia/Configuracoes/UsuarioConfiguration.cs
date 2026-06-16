using IdentityService.Domain.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IdentityService.Infrastructure.Persistencia.Configuracoes;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("usuarios");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasColumnName("id");
        builder.Property(u => u.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
        builder.Property(u => u.HashSenha).HasColumnName("hash_senha").HasMaxLength(255).IsRequired();
        builder.Property(u => u.PrimeiroNome).HasColumnName("primeiro_nome").HasMaxLength(100).IsRequired();
        builder.Property(u => u.Sobrenome).HasColumnName("sobrenome").HasMaxLength(100).IsRequired();
        builder.Property(u => u.Perfil).HasColumnName("perfil").HasMaxLength(50).IsRequired();
        builder.Property(u => u.Ativo).HasColumnName("ativo").IsRequired();
        builder.Property(u => u.CriadoEm).HasColumnName("criado_em").IsRequired();
        builder.Property(u => u.AtualizadoEm).HasColumnName("atualizado_em").IsRequired();

        builder.HasIndex(u => u.Email).IsUnique();

        builder.Ignore(u => u.Eventos);
    }
}
