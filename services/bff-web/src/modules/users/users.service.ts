import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { HmacService } from '../../common/hmac/hmac.service';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { AlterarPerfilDto } from './dto/alterar-perfil.dto';

@Injectable()
export class UsersService {
  private readonly identityUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly hmac: HmacService,
  ) {
    this.identityUrl = this.config.getOrThrow<string>('IDENTITY_SERVICE_URL');
  }

  private cookieHeader(req: Request): string {
    return req.headers.cookie ?? '';
  }

  async me(req: Request): Promise<unknown> {
    const path = '/usuarios/me';
    return this.get(path, req);
  }

  async listar(req: Request): Promise<unknown> {
    const path = '/usuarios';
    return this.get(path, req);
  }

  async obterPorId(id: string, req: Request): Promise<unknown> {
    const path = `/usuarios/${id}`;
    return this.get(path, req);
  }

  async criar(dto: CriarUsuarioDto, req: Request): Promise<unknown> {
    const path = '/usuarios';
    const headers = { ...this.hmac.gerarHeaders('POST', path), cookie: this.cookieHeader(req) };
    return this.post(path, dto, headers);
  }

  async alterarPerfil(id: string, dto: AlterarPerfilDto, req: Request): Promise<void> {
    const path = `/usuarios/${id}/perfil`;
    const headers = { ...this.hmac.gerarHeaders('PATCH', path), cookie: this.cookieHeader(req) };
    try {
      await firstValueFrom(this.http.patch(`${this.identityUrl}${path}`, dto, { headers }));
    } catch (err: any) {
      throw new HttpException(err?.response?.data?.message ?? 'Erro ao alterar perfil.', err?.response?.status ?? 500);
    }
  }

  async desativar(id: string, req: Request): Promise<void> {
    const path = `/usuarios/${id}/desativar`;
    const headers = { ...this.hmac.gerarHeaders('PATCH', path), cookie: this.cookieHeader(req) };
    try {
      await firstValueFrom(this.http.patch(`${this.identityUrl}${path}`, {}, { headers }));
    } catch (err: any) {
      throw new HttpException(err?.response?.data?.message ?? 'Erro ao desativar usuário.', err?.response?.status ?? 500);
    }
  }

  private async get(path: string, req: Request): Promise<unknown> {
    const headers = { ...this.hmac.gerarHeaders('GET', path), cookie: this.cookieHeader(req) };
    try {
      const response = await firstValueFrom(this.http.get(`${this.identityUrl}${path}`, { headers }));
      return response.data;
    } catch (err: any) {
      throw new HttpException(err?.response?.data?.message ?? 'Erro ao consultar usuário.', err?.response?.status ?? 500);
    }
  }

  private async post(path: string, body: unknown, headers: Record<string, string>): Promise<unknown> {
    try {
      const response = await firstValueFrom(this.http.post(`${this.identityUrl}${path}`, body, { headers }));
      return response.data;
    } catch (err: any) {
      throw new HttpException(err?.response?.data?.message ?? 'Erro ao criar usuário.', err?.response?.status ?? 500);
    }
  }
}
