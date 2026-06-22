import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { ConsultasModule } from './modules/consultas/consultas.module';
import { PerfilModule } from './modules/perfil/perfil.module';
import { HealthModule } from './modules/health/health.module';
import { RedisModule } from './common/redis/redis.module';
import { EventsModule } from './common/events/events.module';
import { KafkaModule } from './common/kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    EventsModule,
    KafkaModule,
    AuthModule,
    AgendaModule,
    ConsultasModule,
    PerfilModule,
    HealthModule,
  ],
})
export class AppModule {}
