import { IsEnum, IsString, MinLength } from 'class-validator';

export enum TipoEntrada {
  NotaConsulta = 'NotaConsulta',
  Diagnostico = 'Diagnostico',
  Prescricao = 'Prescricao',
  SolicitacaoExame = 'SolicitacaoExame',
}

export class AdicionarEntradaDto {
  @IsEnum(TipoEntrada)
  tipo: TipoEntrada;

  @IsString()
  @MinLength(3)
  conteudo: string;
}
