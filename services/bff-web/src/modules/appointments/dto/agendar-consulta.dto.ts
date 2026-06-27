import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AgendarConsultaDto {
  @IsUUID('loose')
  idPaciente: string;

  @IsUUID('loose')
  idMedico: string;

  @IsDateString()
  agendadoPara: string;

  @IsInt()
  @Min(10)
  duracaoMinutos: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
