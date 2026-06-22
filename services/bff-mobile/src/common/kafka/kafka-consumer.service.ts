import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, KafkaMessage } from 'kafkajs';
import { RedisService } from '../redis/redis.service';
import { EventsService } from '../events/events.service';

interface ConsultaPayload {
  idConsulta?: string;
  IdConsulta?: string;
  idMedico?: string;
  IdMedico?: string;
  idPaciente?: string;
  IdPaciente?: string;
}

@Injectable()
export class KafkaConsumerService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: Consumer | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    private readonly events: EventsService,
  ) {}

  async onApplicationBootstrap() {
    const brokers = this.config.get<string>('KAFKA_BROKERS');
    if (!brokers) {
      this.logger.warn('KAFKA_BROKERS não configurado — consumer desabilitado');
      return;
    }

    const kafka = new Kafka({ clientId: 'bff-mobile', brokers: brokers.split(',') });
    this.consumer = kafka.consumer({ groupId: 'bff-mobile-group' });

    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topics: ['prontumed.Consulta'], fromBeginning: false });
      await this.consumer.run({ eachMessage: ({ topic, message }) => this.process(topic, message) });
      this.logger.log('Kafka consumer conectado');
    } catch (err) {
      this.logger.error('Falha ao conectar Kafka consumer', err);
    }
  }

  async onApplicationShutdown() {
    await this.consumer?.disconnect();
  }

  private async process(topic: string, message: KafkaMessage): Promise<void> {
    const eventType = message.headers?.['eventType']?.toString();
    if (!eventType || !message.value) return;

    try {
      const payload = JSON.parse(message.value.toString()) as ConsultaPayload;
      if (topic === 'prontumed.Consulta') {
        await this.handleConsulta(eventType, payload);
      }
    } catch (err) {
      this.logger.error(`Erro ao processar evento ${eventType}`, err);
    }
  }

  private async handleConsulta(eventType: string, payload: ConsultaPayload): Promise<void> {
    const idMedico = payload.idMedico ?? payload.IdMedico;
    const idPaciente = payload.idPaciente ?? payload.IdPaciente;
    const idConsulta = payload.idConsulta ?? payload.IdConsulta;

    const keysToDelete: string[] = [];
    if (idMedico) keysToDelete.push(`agenda:hoje:${idMedico}`, `agenda:proximas:${idMedico}`);
    if (idPaciente) keysToDelete.push(`minhas-consultas:${idPaciente}`);
    if (idConsulta) keysToDelete.push(`consulta:detalhe:${idConsulta}`);

    if (keysToDelete.length) await this.redis.del(...keysToDelete);

    const ssePayload = { tipo: eventType, idConsulta, idMedico, idPaciente };
    if (idMedico) this.events.emit(idMedico, ssePayload);
    if (idPaciente) this.events.emit(idPaciente, ssePayload);
  }
}
