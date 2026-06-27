import { IsEnum, IsString, MinLength } from 'class-validator';

export enum TipoEntrada {
  NotaConsulta = 'NotaConsulta',
  Diagnostico = 'Diagnostico',
  Prescricao = 'Prescricao',
  Exame = 'Exame',
}

export class AdicionarEntradaDto {
  @IsEnum(TipoEntrada)
  tipoEntrada: TipoEntrada;

  @IsString()
  @MinLength(3)
  conteudo: string;
}
