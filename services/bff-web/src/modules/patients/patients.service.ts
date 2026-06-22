import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { HmacService } from '../../common/hmac/hmac.service';
import { CriarPacienteDto } from './dto/criar-paciente.dto';
import { AtualizarPacienteDto } from './dto/atualizar-paciente.dto';

@Injectable()
export class PatientsService {
  private readonly patientUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly hmac: HmacService,
  ) {
    this.patientUrl = this.config.getOrThrow<string>('PATIENT_SERVICE_URL');
  }

  private cookieHeader(req: Request): string {
    return req.headers.cookie ?? '';
  }

  async listar(req: Request): Promise<unknown> {
    const path = '/pacientes';
    const headers = { ...this.hmac.gerarHeaders('GET', path), cookie: this.cookieHeader(req) };
    return this.get(`${this.patientUrl}${path}`, headers);
  }

  async obterPorId(id: string, req: Request): Promise<unknown> {
    const path = `/pacientes/${id}`;
    const headers = { ...this.hmac.gerarHeaders('GET', path), cookie: this.cookieHeader(req) };
    return this.get(`${this.patientUrl}${path}`, headers);
  }

  async obterPorCpf(cpf: string, req: Request): Promise<unknown> {
    const path = `/pacientes/cpf/${cpf}`;
    const headers = { ...this.hmac.gerarHeaders('GET', path), cookie: this.cookieHeader(req) };
    return this.get(`${this.patientUrl}${path}`, headers);
  }

  async criar(dto: CriarPacienteDto, req: Request): Promise<unknown> {
    const path = '/pacientes';
    const headers = { ...this.hmac.gerarHeaders('POST', path), cookie: this.cookieHeader(req) };
    try {
      const response = await firstValueFrom(this.http.post(`${this.patientUrl}${path}`, dto, { headers }));
      return response.data;
    } catch (err: any) {
      throw new HttpException(err?.response?.data?.message ?? 'Erro ao cadastrar paciente.', err?.response?.status ?? 500);
    }
  }

  async atualizar(id: string, dto: AtualizarPacienteDto, req: Request): Promise<unknown> {
    const path = `/pacientes/${id}`;
    const headers = { ...this.hmac.gerarHeaders('PUT', path), cookie: this.cookieHeader(req) };
    try {
      const response = await firstValueFrom(this.http.put(`${this.patientUrl}${path}`, dto, { headers }));
      return response.data;
    } catch (err: any) {
      throw new HttpException(err?.response?.data?.message ?? 'Erro ao atualizar paciente.', err?.response?.status ?? 500);
    }
  }

  async desativar(id: string, req: Request): Promise<void> {
    const path = `/pacientes/${id}/desativar`;
    const headers = { ...this.hmac.gerarHeaders('PATCH', path), cookie: this.cookieHeader(req) };
    try {
      await firstValueFrom(this.http.patch(`${this.patientUrl}${path}`, {}, { headers }));
    } catch (err: any) {
      throw new HttpException(err?.response?.data?.message ?? 'Erro ao desativar paciente.', err?.response?.status ?? 500);
    }
  }

  private async get(url: string, headers: Record<string, string>): Promise<unknown> {
    try {
      const response = await firstValueFrom(this.http.get(url, { headers }));
      return response.data;
    } catch (err: any) {
      throw new HttpException(err?.response?.data?.message ?? 'Erro ao consultar paciente.', err?.response?.status ?? 500);
    }
  }
}
