import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { PerfilService } from './perfil.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('perfil')
@UseGuards(JwtAuthGuard)
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Get()
  obter(@Req() req: Request) {
    return this.perfilService.obter(req);
  }
}
