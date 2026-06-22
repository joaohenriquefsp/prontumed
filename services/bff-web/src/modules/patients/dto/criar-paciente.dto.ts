import { IsDateString, IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CriarPacienteDto {
  @IsString()
  primeiroNome: string;

  @IsString()
  sobrenome: string;

  @IsString()
  @Length(11, 11)
  @Matches(/^\d{11}$/, { message: 'CPF deve conter exatamente 11 dígitos numéricos.' })
  cpf: string;

  @IsDateString()
  dataNascimento: string;

  @IsString()
  telefone: string;

  @IsEmail()
  email: string;

  @IsString()
  logradouro: string;

  @IsString()
  cidade: string;

  @IsString()
  @Length(2, 2)
  uf: string;

  @IsString()
  @Length(8, 8)
  cep: string;
}
