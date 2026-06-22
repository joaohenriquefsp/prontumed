import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PerfilController } from './perfil.controller';
import { PerfilService } from './perfil.service';
import { HmacService } from '../../common/hmac/hmac.service';

@Module({
  imports: [HttpModule],
  controllers: [PerfilController],
  providers: [PerfilService, HmacService],
})
export class PerfilModule {}
