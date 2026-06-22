import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { HmacService } from '../../common/hmac/hmac.service';

@Injectable()
export class PerfilService {
  private readonly identityUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly hmac: HmacService,
  ) {
    this.identityUrl = this.config.getOrThrow<string>('IDENTITY_SERVICE_URL');
  }

  async obter(req: Request): Promise<unknown> {
    const path = '/usuarios/me';
    const headers = { ...this.hmac.gerarHeaders('GET', path), cookie: req.headers.cookie ?? '' };

    try {
      const response = await firstValueFrom(this.http.get(`${this.identityUrl}${path}`, { headers }));
      return response.data;
    } catch (err: any) {
      throw new HttpException(
        err?.response?.data?.message ?? 'Erro ao buscar perfil.',
        err?.response?.status ?? 500,
      );
    }
  }
}
