import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { HmacService } from '../../common/hmac/hmac.service';

@Module({
  imports: [HttpModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, HmacService],
})
export class AppointmentsModule {}
