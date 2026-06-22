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

interface UsuarioRaw {
  id: string;
  primeiroNome: string;
  sobrenome: string;
}

export interface ConsultaPacienteResponse {
  id: string;
  dataHora: string;
  status: string;
  observacoes?: string;
  medico: {
    id: string;
    nomeCompleto: string;
  };
}

@Injectable()
export class ConsultasService {
  private readonly appointmentUrl: string;
  private readonly identityUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly hmac: HmacService,
  ) {
    this.appointmentUrl = this.config.getOrThrow<string>('APPOINTMENT_SERVICE_URL');
    this.identityUrl = this.config.getOrThrow<string>('IDENTITY_SERVICE_URL');
  }

  async minhasConsultas(user: JwtPayload, req: Request): Promise<ConsultaPacienteResponse[]> {
    // O Appointment Service filtra por idPaciente quando o JWT tem perfil Patient
    const path = '/consultas';
    const headers = { ...this.hmac.gerarHeaders('GET', path), cookie: req.headers.cookie ?? '' };

    const consultas = await this.get<ConsultaRaw[]>(
      `${this.appointmentUrl}${path}`,
      headers,
      'Erro ao buscar consultas.',
    );

    if (!consultas.length) return [];

    // busca dados de todos os médicos únicos em paralelo
    const idsUnicos = [...new Set(consultas.map((c) => c.idMedico))];
    const medicos = await Promise.all(
      idsUnicos.map((id) => this.buscarUsuario(id, req)),
    );

    const mapMedicos = new Map(medicos.map((m) => [m.id, m]));

    return consultas.map((c) => {
      const medico = mapMedicos.get(c.idMedico);
      return {
        id: c.id,
        dataHora: c.dataHora,
        status: c.status,
        observacoes: c.observacoes,
        medico: {
          id: c.idMedico,
          nomeCompleto: medico
            ? `Dr(a). ${medico.primeiroNome} ${medico.sobrenome}`
            : 'Médico não encontrado',
        },
      };
    });
  }

  async detalhe(id: string, user: JwtPayload, req: Request): Promise<ConsultaPacienteResponse> {
    const path = `/consultas/${id}`;
    const headers = { ...this.hmac.gerarHeaders('GET', path), cookie: req.headers.cookie ?? '' };

    const consulta = await this.get<ConsultaRaw>(
      `${this.appointmentUrl}${path}`,
      headers,
      'Consulta não encontrada.',
    );

    const medico = await this.buscarUsuario(consulta.idMedico, req);

    return {
      id: consulta.id,
      dataHora: consulta.dataHora,
      status: consulta.status,
      observacoes: consulta.observacoes,
      medico: {
        id: consulta.idMedico,
        nomeCompleto: `Dr(a). ${medico.primeiroNome} ${medico.sobrenome}`,
      },
    };
  }

  private async buscarUsuario(id: string, req: Request): Promise<UsuarioRaw> {
    const path = `/usuarios/${id}`;
    const headers = { ...this.hmac.gerarHeaders('GET', path), cookie: req.headers.cookie ?? '' };
    return this.get<UsuarioRaw>(`${this.identityUrl}${path}`, headers, 'Erro ao buscar médico.');
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
