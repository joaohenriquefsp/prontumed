import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AgendaController } from './agenda.controller';
import { AgendaService } from './agenda.service';
import { HmacService } from '../../common/hmac/hmac.service';

@Module({
  imports: [HttpModule],
  controllers: [AgendaController],
  providers: [AgendaService, HmacService],
})
export class AgendaModule {}
