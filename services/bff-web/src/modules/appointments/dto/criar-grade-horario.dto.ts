import { IsInt, IsString, IsUUID, Max, Min } from 'class-validator';

export class CriarGradeHorarioDto {
  @IsUUID()
  idMedico: string;

  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number;

  @IsString()
  horaInicio: string;

  @IsString()
  horaFim: string;

  @IsInt()
  @Min(10)
  duracaoMinutos: number;
}
