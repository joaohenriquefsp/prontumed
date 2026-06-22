import { Injectable, UnauthorizedException, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { Response, Request } from 'express';
import { HmacService } from '../../common/hmac/hmac.service';
import { LoginDto } from './dto/login.dto';

type AxiosErr = { response?: { data?: { message?: string }; status?: number } };

@Injectable()
export class AuthService {
  private readonly identityUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly hmac: HmacService,
  ) {
    this.identityUrl = this.config.getOrThrow<string>('IDENTITY_SERVICE_URL');
  }

  async login(dto: LoginDto, res: Response): Promise<void> {
    const path = '/auth/login';
    const headers = this.hmac.gerarHeaders('POST', path);

    try {
      const response = await firstValueFrom(
        this.http.post(`${this.identityUrl}${path}`, dto, { headers, withCredentials: true }),
      );

      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        cookies.forEach((c) => res.setHeader('Set-Cookie', c));
      }

      res.json(response.data);
    } catch (err: unknown) {
      const e = err as AxiosErr;
      throw new HttpException(
        e?.response?.data?.message ?? 'Erro ao autenticar.',
        e?.response?.status ?? 500,
      );
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const path = '/auth/refresh';
    const headers = { ...this.hmac.gerarHeaders('POST', path), cookie: req.headers.cookie ?? '' };

    try {
      const response = await firstValueFrom(
        this.http.post(`${this.identityUrl}${path}`, {}, { headers, withCredentials: true }),
      );

      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        cookies.forEach((c) => res.setHeader('Set-Cookie', c));
      }

      res.json(response.data);
    } catch {
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    const path = '/auth/logout';
    const headers = { ...this.hmac.gerarHeaders('POST', path), cookie: req.headers.cookie ?? '' };

    try {
      await firstValueFrom(this.http.post(`${this.identityUrl}${path}`, {}, { headers }));
    } catch {
      // ignora falha no serviço; limpa cookie de qualquer forma
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.json({ message: 'Logout realizado.' });
  }
}
