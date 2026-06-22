import { IsDateString, IsString, IsUUID, IsOptional } from 'class-validator';

export class AgendarConsultaDto {
  @IsUUID()
  idPaciente: string;

  @IsUUID()
  idMedico: string;

  @IsDateString()
  dataHora: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
