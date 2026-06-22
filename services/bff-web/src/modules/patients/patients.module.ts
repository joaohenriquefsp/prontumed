import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { HmacService } from '../../common/hmac/hmac.service';

@Module({
  imports: [HttpModule],
  controllers: [PatientsController],
  providers: [PatientsService, HmacService],
})
export class PatientsModule {}
