import { Injectable, UnauthorizedException, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Response, Request } from 'express';
import { HmacService } from '../../common/hmac/hmac.service';
import { LoginDto } from './dto/login.dto';
import { AlterarSenhaDto } from './dto/alterar-senha.dto';

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
        this.http.post(`${this.identityUrl}${path}`, dto, {
          headers,
          withCredentials: true,
        }),
      );

      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        cookies.forEach((c) => res.setHeader('Set-Cookie', c));
      }

      res.json(response.data);
    } catch (err: any) {
      const status = err?.response?.status ?? 500;
      const message = err?.response?.data?.message ?? 'Erro ao autenticar.';
      throw new HttpException(message, status);
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const path = '/auth/refresh';
    const headers = this.hmac.gerarHeaders('POST', path);
    const cookieHeader = req.headers.cookie ?? '';

    try {
      const response = await firstValueFrom(
        this.http.post(
          `${this.identityUrl}${path}`,
          {},
          { headers: { ...headers, cookie: cookieHeader }, withCredentials: true },
        ),
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
    const headers = this.hmac.gerarHeaders('POST', path);
    const cookieHeader = req.headers.cookie ?? '';

    try {
      await firstValueFrom(
        this.http.post(
          `${this.identityUrl}${path}`,
          {},
          { headers: { ...headers, cookie: cookieHeader } },
        ),
      );
    } catch {
      // ignora falha no serviço; limpa cookie de qualquer forma
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.json({ message: 'Logout realizado.' });
  }

  async alterarSenha(dto: AlterarSenhaDto, req: Request): Promise<void> {
    const path = '/auth/alterar-senha';
    const headers = this.hmac.gerarHeaders('POST', path);
    const cookieHeader = req.headers.cookie ?? '';

    try {
      await firstValueFrom(
        this.http.post(`${this.identityUrl}${path}`, dto, {
          headers: { ...headers, cookie: cookieHeader },
        }),
      );
    } catch (err: any) {
      const status = err?.response?.status ?? 500;
      const message = err?.response?.data?.message ?? 'Erro ao alterar senha.';
      throw new HttpException(message, status);
    }
  }
}
