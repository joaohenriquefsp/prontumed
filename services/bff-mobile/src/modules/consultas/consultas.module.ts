import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConsultasController } from './consultas.controller';
import { ConsultasService } from './consultas.service';
import { HmacService } from '../../common/hmac/hmac.service';

@Module({
  imports: [HttpModule],
  controllers: [ConsultasController],
  providers: [ConsultasService, HmacService],
})
export class ConsultasModule {}
