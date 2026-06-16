using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PatientService.Domain.Entities;

namespace PatientService.Infrastructure.Persistence.Configurations;

public class PacienteConfiguration : IEntityTypeConfiguration<Paciente>
{
    public void Configure(EntityTypeBuilder<Paciente> builder)
    {
        builder.ToTable("pacientes");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.IdUsuario).HasColumnName("id_usuario");
        builder.Property(p => p.PrimeiroNome).HasColumnName("primeiro_nome").HasMaxLength(100).IsRequired();
        builder.Property(p => p.Sobrenome).HasColumnName("sobrenome").HasMaxLength(100).IsRequired();
        builder.Property(p => p.Cpf).HasColumnName("cpf").HasMaxLength(11).IsRequired();
        builder.Property(p => p.DataNascimento).HasColumnName("data_nascimento").IsRequired();
        builder.Property(p => p.Sexo).HasColumnName("sexo").HasMaxLength(20);
        builder.Property(p => p.Telefone).HasColumnName("telefone").HasMaxLength(20);
        builder.Property(p => p.Email).HasColumnName("email").HasMaxLength(255);
        builder.Property(p => p.EnderecoLogradouro).HasColumnName("endereco_logradouro").HasMaxLength(255);
        builder.Property(p => p.EnderecoCidade).HasColumnName("endereco_cidade").HasMaxLength(100);
        builder.Property(p => p.EnderecoUf).HasColumnName("endereco_uf").HasMaxLength(2);
        builder.Property(p => p.EnderecoCep).HasColumnName("endereco_cep").HasMaxLength(8);
        builder.Property(p => p.Ativo).HasColumnName("ativo").IsRequired();
        builder.Property(p => p.CriadoEm).HasColumnName("criado_em").IsRequired();
        builder.Property(p => p.AtualizadoEm).HasColumnName("atualizado_em").IsRequired();

        builder.HasIndex(p => p.Cpf).IsUnique();
        builder.HasIndex(p => p.IdUsuario).IsUnique();

        builder.Ignore(p => p.Eventos);
    }
}
