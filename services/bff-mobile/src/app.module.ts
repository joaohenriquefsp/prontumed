import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { ConsultasModule } from './modules/consultas/consultas.module';
import { PerfilModule } from './modules/perfil/perfil.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AgendaModule,
    ConsultasModule,
    PerfilModule,
    HealthModule,
  ],
})
export class AppModule {}
