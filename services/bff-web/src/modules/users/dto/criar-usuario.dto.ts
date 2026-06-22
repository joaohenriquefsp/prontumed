import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';

export enum Perfil {
  Doctor = 'Doctor',
  Receptionist = 'Receptionist',
  Admin = 'Admin',
  Patient = 'Patient',
}

export class CriarUsuarioDto {
  @IsString()
  primeiroNome: string;

  @IsString()
  sobrenome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsEnum(Perfil)
  perfil: Perfil;
}
