import { IsInt, IsString, IsUUID, Max, Min } from 'class-validator';

export class CriarGradeHorarioDto {
  @IsUUID('loose')
  idMedico: string;

  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number;

  @IsString()
  horarioInicio: string;

  @IsString()
  horarioFim: string;

  @IsInt()
  @Min(15)
  duracaoSlotMinutos: number;
}
