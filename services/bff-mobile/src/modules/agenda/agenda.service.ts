import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { HmacService } from '../../common/hmac/hmac.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

interface ConsultaRaw {
  id: string;
  idPaciente: string;
  idMedico: string;
  dataHora: string;
  status: string;
  observacoes?: string;
}

interface PacienteRaw {
  id: string;
  primeiroNome: string;
  sobrenome: string;
  telefone: string;
}

export interface ConsultaAgendaResponse {
  id: string;
  dataHora: string;
  status: string;
  observacoes?: string;
  paciente: {
    id: string;
    nomeCompleto: string;
    telefone: string;
  };
}

@Injectable()
export class AgendaService {
  private readonly appointmentUrl: string;
  private readonly patientUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly hmac: HmacService,
  ) {
    this.appointmentUrl = this.config.getOrThrow<string>('APPOINTMENT_SERVICE_URL');
    this.patientUrl = this.config.getOrThrow<string>('PATIENT_SERVICE_URL');
  }

  async hoje(user: JwtPayload, req: Request): Promise<ConsultaAgendaResponse[]> {
    const hoje = new Date().toISOString().split('T')[0];
    return this.buscarEComporConsultas(user.sub, hoje, req);
  }

  async proximas(user: JwtPayload, req: Request): Promise<ConsultaAgendaResponse[]> {
    const hoje = new Date().toISOString().split('T')[0];
    const qs = `idMedico=${user.sub}&dataInicio=${hoje}`;
    const path = '/consultas';
    const headers = { ...this.hmac.gerarHeaders('GET', path, qs), cookie: req.headers.cookie ?? '' };

    const consultas = await this.get<ConsultaRaw[]>(
      `${this.appointmentUrl}${path}?${qs}`,
      headers,
      'Erro ao buscar próximas consultas.',
    );

    return this.enriquecerConsultas(consultas, req);
  }

  async concluir(id: string, req: Request): Promise<void> {
    const path = `/consultas/${id}/concluir`;
    const headers = { ...this.hmac.gerarHeaders('PATCH', path), cookie: req.headers.cookie ?? '' };
    try {
      await firstValueFrom(this.http.patch(`${this.appointmentUrl}${path}`, {}, { headers }));
    } catch (err: any) {
      throw new HttpException(
        err?.response?.data?.message ?? 'Erro ao concluir consulta.',
        err?.response?.status ?? 500,
      );
    }
  }

  async noShow(id: string, req: Request): Promise<void> {
    const path = `/consultas/${id}/no-show`;
    const headers = { ...this.hmac.gerarHeaders('PATCH', path), cookie: req.headers.cookie ?? '' };
    try {
      await firstValueFrom(this.http.patch(`${this.appointmentUrl}${path}`, {}, { headers }));
    } catch (err: any) {
      throw new HttpException(
        err?.response?.data?.message ?? 'Erro ao registrar ausência.',
        err?.response?.status ?? 500,
      );
    }
  }

  private async buscarEComporConsultas(
    idMedico: string,
    data: string,
    req: Request,
  ): Promise<ConsultaAgendaResponse[]> {
    const qs = `idMedico=${idMedico}&data=${data}`;
    const path = '/consultas';
    const headers = { ...this.hmac.gerarHeaders('GET', path, qs), cookie: req.headers.cookie ?? '' };

    const consultas = await this.get<ConsultaRaw[]>(
      `${this.appointmentUrl}${path}?${qs}`,
      headers,
      'Erro ao buscar consultas do dia.',
    );

    return this.enriquecerConsultas(consultas, req);
  }

  private async enriquecerConsultas(
    consultas: ConsultaRaw[],
    req: Request,
  ): Promise<ConsultaAgendaResponse[]> {
    if (!consultas.length) return [];

    // busca dados de todos os pacientes únicos em paralelo
    const idsUnicos = [...new Set(consultas.map((c) => c.idPaciente))];
    const pacientes = await Promise.all(
      idsUnicos.map((id) => this.buscarPaciente(id, req)),
    );

    const mapPacientes = new Map(pacientes.map((p) => [p.id, p]));

    return consultas.map((c) => {
      const paciente = mapPacientes.get(c.idPaciente);
      return {
        id: c.id,
        dataHora: c.dataHora,
        status: c.status,
        observacoes: c.observacoes,
        paciente: {
          id: c.idPaciente,
          nomeCompleto: paciente
            ? `${paciente.primeiroNome} ${paciente.sobrenome}`
            : 'Paciente não encontrado',
          telefone: paciente?.telefone ?? '',
        },
      };
    });
  }

  private async buscarPaciente(id: string, req: Request): Promise<PacienteRaw> {
    const path = `/pacientes/${id}`;
    const headers = { ...this.hmac.gerarHeaders('GET', path), cookie: req.headers.cookie ?? '' };
    return this.get<PacienteRaw>(`${this.patientUrl}${path}`, headers, 'Erro ao buscar paciente.');
  }

  private async get<T>(url: string, headers: Record<string, string>, errorMsg: string): Promise<T> {
    try {
      const response = await firstValueFrom(this.http.get<T>(url, { headers }));
      return response.data;
    } catch (err: any) {
      throw new HttpException(err?.response?.data?.message ?? errorMsg, err?.response?.status ?? 500);
    }
  }
}
