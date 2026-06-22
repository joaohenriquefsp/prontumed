import { IsOptional, IsString } from 'class-validator';

export class AlterarPerfilDto {
  @IsOptional()
  @IsString()
  primeiroNome?: string;

  @IsOptional()
  @IsString()
  sobrenome?: string;
}
