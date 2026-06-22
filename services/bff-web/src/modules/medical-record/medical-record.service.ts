import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { HmacService } from '../../common/hmac/hmac.service';
import { AdicionarEntradaDto } from './dto/adicionar-entrada.dto';

type AxiosErr = { response?: { data?: { message?: string }; status?: number } };

@Injectable()
export class MedicalRecordService {
  private readonly medicalRecordUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly hmac: HmacService,
  ) {
    this.medicalRecordUrl = this.config.getOrThrow<string>('MEDICAL_RECORD_SERVICE_URL');
  }

  private cookieHeader(req: Request): string {
    return req.headers.cookie ?? '';
  }

  async obterProntuario(idPaciente: string, req: Request): Promise<unknown> {
    const path = `/prontuarios/${idPaciente}`;
    const headers = { ...this.hmac.gerarHeaders('GET', path), cookie: this.cookieHeader(req) };
    return this.get(`${this.medicalRecordUrl}${path}`, headers);
  }

  async criarProntuario(idPaciente: string, req: Request): Promise<unknown> {
    const path = `/prontuarios/${idPaciente}`;
    const headers = { ...this.hmac.gerarHeaders('POST', path), cookie: this.cookieHeader(req) };
    try {
      const response = await firstValueFrom(this.http.post(`${this.medicalRecordUrl}${path}`, {}, { headers }));
      return response.data;
    } catch (err: unknown) {
      const e = err as AxiosErr;
      throw new HttpException(e?.response?.data?.message ?? 'Erro ao criar prontuário.', e?.response?.status ?? 500);
    }
  }

  async adicionarEntrada(idPaciente: string, dto: AdicionarEntradaDto, req: Request): Promise<unknown> {
    const path = `/prontuarios/${idPaciente}/entradas`;
    const headers = { ...this.hmac.gerarHeaders('POST', path), cookie: this.cookieHeader(req) };
    try {
      const response = await firstValueFrom(this.http.post(`${this.medicalRecordUrl}${path}`, dto, { headers }));
      return response.data;
    } catch (err: unknown) {
      const e = err as AxiosErr;
      throw new HttpException(e?.response?.data?.message ?? 'Erro ao adicionar entrada.', e?.response?.status ?? 500);
    }
  }

  async obterEntrada(idPaciente: string, idEntrada: string, req: Request): Promise<unknown> {
    const path = `/prontuarios/${idPaciente}/entradas/${idEntrada}`;
    const headers = { ...this.hmac.gerarHeaders('GET', path), cookie: this.cookieHeader(req) };
    return this.get(`${this.medicalRecordUrl}${path}`, headers);
  }

  async obterHistorico(idPaciente: string, req: Request): Promise<unknown> {
    const path = `/prontuarios/${idPaciente}/historico`;
    const headers = { ...this.hmac.gerarHeaders('GET', path), cookie: this.cookieHeader(req) };
    return this.get(`${this.medicalRecordUrl}${path}`, headers);
  }

  private async get(url: string, headers: Record<string, string>): Promise<unknown> {
    try {
      const response = await firstValueFrom(this.http.get(url, { headers }));
      return response.data;
    } catch (err: unknown) {
      const e = err as AxiosErr;
      throw new HttpException(e?.response?.data?.message ?? 'Erro ao consultar prontuário.', e?.response?.status ?? 500);
    }
  }
}
