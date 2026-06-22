import { IsString, MinLength } from 'class-validator';

export class AlterarSenhaDto {
  @IsString()
  @MinLength(6)
  senhaAtual: string;

  @IsString()
  @MinLength(6)
  novaSenha: string;
}
