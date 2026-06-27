import { IsIn, IsString } from 'class-validator';

export class AlterarPerfilDto {
  @IsString()
  @IsIn(['Admin', 'Doctor', 'Receptionist', 'Patient'])
  novoPerfil!: string;
}
