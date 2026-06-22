import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { HmacService } from '../../common/hmac/hmac.service';
import { RedisService } from '../../common/redis/redis.service';
import { AgendarConsultaDto } from './dto/agendar-consulta.dto';
import { CancelarConsultaDto } from './dto/cancelar-consulta.dto';
import { CriarGradeHorarioDto } from './dto/criar-grade-horario.dto';

const TTL_CONSULTA = 60;

@Injectable()
export class AppointmentsService {
  private readonly appointmentUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly hmac: HmacService,
    private readonly redis: RedisService,
  ) {
    this.appointmentUrl = this.config.getOrThrow<string>('APPOINTMENT_SERVICE_URL');
  }

  private cookieHeader(req: Request): string {
    return req.headers.cookie ?? '';
  }

  async listarConsultas(query: string, req: Request): Promise<unknown> {
    const path = '/consultas';
    const qs = query ? `?${query}` : '';
    const headers = { ...this.hmac.gerarHeaders('GET', path, qs ? query : ''), cookie: this.cookieHeader(req) };
    return this.get(`${this.appointmentUrl}${path}${qs}`, headers);
  }

  async obterConsulta(id: string, req: Request): Promise<unknown> {
    const cacheKey = `consulta:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const path = `/consultas/${id}`;
    const headers = { ...this.hmac.gerarHeaders('GET', path), cookie: this.cookieHeader(req) };
    const data = await this.get(`${this.appointmentUrl}${path}`, headers);

    await this.redis.set(cacheKey, data, TTL_CONSULTA);
    return data;
  }

  async agendar(dto: AgendarConsultaDto, req: Request): Promise<unknown> {
    const path = '/consultas';
    const headers = { ...this.hmac.gerarHeaders('POST', path), cookie: this.cookieHeader(req) };
    return this.post(`${this.appointmentUrl}${path}`, dto, headers);
  }

  async confirmar(id: string, req: Request): Promise<void> {
    await this.patch(`/consultas/${id}/confirmar`, {}, req);
    await this.redis.del(`consulta:${id}`);
  }

  async cancelar(id: string, dto: CancelarConsultaDto, req: Request): Promise<void> {
    await this.patch(`/consultas/${id}/cancelar`, dto, req);
    await this.redis.del(`consulta:${id}`);
  }

  async concluir(id: string, req: Request): Promise<void> {
    await this.patch(`/consultas/${id}/concluir`, {}, req);
    await this.redis.del(`consulta:${id}`);
  }

  async noShow(id: string, req: Request): Promise<void> {
    await this.patch(`/consultas/${id}/no-show`, {}, req);
    await this.redis.del(`consulta:${id}`);
  }

  async disponibilidade(idMedico: string, data: string, req: Request): Promise<unknown> {
    const path = '/disponibilidade';
    const qs = `idMedico=${idMedico}&data=${data}`;
    const headers = { ...this.hmac.gerarHeaders('GET', path, qs), cookie: this.cookieHeader(req) };
    return this.get(`${this.appointmentUrl}${path}?${qs}`, headers);
  }

  async listarGradeHorarios(idMedico: string, req: Request): Promise<unknown> {
    const path = '/grade-horarios';
    const qs = idMedico ? `idMedico=${idMedico}` : '';
    const headers = { ...this.hmac.gerarHeaders('GET', path, qs), cookie: this.cookieHeader(req) };
    return this.get(`${this.appointmentUrl}${path}${qs ? '?' + qs : ''}`, headers);
  }

  async criarGradeHorario(dto: CriarGradeHorarioDto, req: Request): Promise<unknown> {
    const path = '/grade-horarios';
    const headers = { ...this.hmac.gerarHeaders('POST', path), cookie: this.cookieHeader(req) };
    return this.post(`${this.appointmentUrl}${path}`, dto, headers);
  }

  async deletarGradeHorario(id: string, req: Request): Promise<void> {
    const path = `/grade-horarios/${id}`;
    const headers = { ...this.hmac.gerarHeaders('DELETE', path), cookie: this.cookieHeader(req) };
    try {
      await firstValueFrom(this.http.delete(`${this.appointmentUrl}${path}`, { headers }));
    } catch (err: any) {
      throw new HttpException(err?.response?.data?.message ?? 'Erro ao deletar grade horária.', err?.response?.status ?? 500);
    }
  }

  private async get(url: string, headers: Record<string, string>): Promise<unknown> {
    try {
      const response = await firstValueFrom(this.http.get(url, { headers }));
      return response.data;
    } catch (err: any) {
      throw new HttpException(err?.response?.data?.message ?? 'Erro ao consultar agendamento.', err?.response?.status ?? 500);
    }
  }

  private async post(url: string, body: unknown, headers: Record<string, string>): Promise<unknown> {
    try {
      const response = await firstValueFrom(this.http.post(url, body, { headers }));
      return response.data;
    } catch (err: any) {
      throw new HttpException(err?.response?.data?.message ?? 'Erro ao processar agendamento.', err?.response?.status ?? 500);
    }
  }

  private async patch(path: string, body: unknown, req: Request): Promise<void> {
    const headers = { ...this.hmac.gerarHeaders('PATCH', path), cookie: this.cookieHeader(req) };
    try {
      await firstValueFrom(this.http.patch(`${this.appointmentUrl}${path}`, body, { headers }));
    } catch (err: any) {
      throw new HttpException(err?.response?.data?.message ?? 'Erro ao atualizar consulta.', err?.response?.status ?? 500);
    }
  }
}
