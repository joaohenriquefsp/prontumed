import { Controller, Get, HttpCode, Param, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AgendaService } from './agenda.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('agenda')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Doctor')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get('hoje')
  hoje(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    return this.agendaService.hoje(user, req);
  }

  @Get('proximas')
  proximas(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    return this.agendaService.proximas(user, req);
  }

  @Patch(':id/concluir')
  @HttpCode(204)
  concluir(@Param('id') id: string, @Req() req: Request) {
    return this.agendaService.concluir(id, req);
  }

  @Patch(':id/no-show')
  @HttpCode(204)
  noShow(@Param('id') id: string, @Req() req: Request) {
    return this.agendaService.noShow(id, req);
  }
}
