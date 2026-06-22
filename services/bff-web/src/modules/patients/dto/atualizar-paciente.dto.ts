import { IsDateString, IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class AtualizarPacienteDto {
  @IsOptional()
  @IsString()
  primeiroNome?: string;

  @IsOptional()
  @IsString()
  sobrenome?: string;

  @IsOptional()
  @IsDateString()
  dataNascimento?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  logradouro?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  uf?: string;

  @IsOptional()
  @IsString()
  @Length(8, 8)
  cep?: string;
}
