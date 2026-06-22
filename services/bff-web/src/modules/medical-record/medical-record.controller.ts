import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { MedicalRecordService } from './medical-record.service';
import { AdicionarEntradaDto } from './dto/adicionar-entrada.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('prontuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Doctor')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Get(':idPaciente')
  obterProntuario(@Param('idPaciente') idPaciente: string, @Req() req: Request) {
    return this.medicalRecordService.obterProntuario(idPaciente, req);
  }

  @Post(':idPaciente')
  criarProntuario(@Param('idPaciente') idPaciente: string, @Req() req: Request) {
    return this.medicalRecordService.criarProntuario(idPaciente, req);
  }

  @Post(':idPaciente/entradas')
  adicionarEntrada(
    @Param('idPaciente') idPaciente: string,
    @Body() dto: AdicionarEntradaDto,
    @Req() req: Request,
  ) {
    return this.medicalRecordService.adicionarEntrada(idPaciente, dto, req);
  }

  @Get(':idPaciente/entradas/:idEntrada')
  obterEntrada(
    @Param('idPaciente') idPaciente: string,
    @Param('idEntrada') idEntrada: string,
    @Req() req: Request,
  ) {
    return this.medicalRecordService.obterEntrada(idPaciente, idEntrada, req);
  }

  @Get(':idPaciente/historico')
  @Roles('Doctor', 'Admin')
  obterHistorico(@Param('idPaciente') idPaciente: string, @Req() req: Request) {
    return this.medicalRecordService.obterHistorico(idPaciente, req);
  }
}
