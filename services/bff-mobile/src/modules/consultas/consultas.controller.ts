import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ConsultasService } from './consultas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('minhas-consultas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Patient')
export class ConsultasController {
  constructor(private readonly consultasService: ConsultasService) {}

  @Get()
  minhasConsultas(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    return this.consultasService.minhasConsultas(user, req);
  }

  @Get(':id')
  detalhe(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Req() req: Request) {
    return this.consultasService.detalhe(id, user, req);
  }
}
