import {
  Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AppointmentsService } from './appointments.service';
import { AgendarConsultaDto } from './dto/agendar-consulta.dto';
import { CancelarConsultaDto } from './dto/cancelar-consulta.dto';
import { CriarGradeHorarioDto } from './dto/criar-grade-horario.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // --- Consultas ---

  @Get('consultas')
  @Roles('Doctor', 'Receptionist', 'Admin')
  listarConsultas(@Query() query: Record<string, string>, @Req() req: Request) {
    const qs = new URLSearchParams(query).toString();
    return this.appointmentsService.listarConsultas(qs, req);
  }

  @Get('consultas/:id')
  @Roles('Doctor', 'Receptionist', 'Admin')
  obterConsulta(@Param('id') id: string, @Req() req: Request) {
    return this.appointmentsService.obterConsulta(id, req);
  }

  @Post('consultas')
  @Roles('Receptionist', 'Admin')
  agendar(@Body() dto: AgendarConsultaDto, @Req() req: Request) {
    return this.appointmentsService.agendar(dto, req);
  }

  @Patch('consultas/:id/confirmar')
  @HttpCode(204)
  @Roles('Receptionist', 'Admin')
  confirmar(@Param('id') id: string, @Req() req: Request) {
    return this.appointmentsService.confirmar(id, req);
  }

  @Patch('consultas/:id/cancelar')
  @HttpCode(204)
  @Roles('Receptionist', 'Admin')
  cancelar(@Param('id') id: string, @Body() dto: CancelarConsultaDto, @Req() req: Request) {
    return this.appointmentsService.cancelar(id, dto, req);
  }

  @Patch('consultas/:id/concluir')
  @HttpCode(204)
  @Roles('Doctor')
  concluir(@Param('id') id: string, @Req() req: Request) {
    return this.appointmentsService.concluir(id, req);
  }

  @Patch('consultas/:id/no-show')
  @HttpCode(204)
  @Roles('Doctor', 'Admin')
  noShow(@Param('id') id: string, @Req() req: Request) {
    return this.appointmentsService.noShow(id, req);
  }

  // --- Disponibilidade ---

  @Get('disponibilidade')
  @Roles('Doctor', 'Receptionist', 'Admin')
  disponibilidade(
    @Query('idMedico') idMedico: string,
    @Query('data') data: string,
    @Req() req: Request,
  ) {
    return this.appointmentsService.disponibilidade(idMedico, data, req);
  }

  // --- Grade de Horários ---

  @Get('grade-horarios')
  @Roles('Doctor', 'Receptionist', 'Admin')
  listarGradeHorarios(@Query('idMedico') idMedico: string, @Req() req: Request) {
    return this.appointmentsService.listarGradeHorarios(idMedico, req);
  }

  @Post('grade-horarios')
  @Roles('Admin')
  criarGradeHorario(@Body() dto: CriarGradeHorarioDto, @Req() req: Request) {
    return this.appointmentsService.criarGradeHorario(dto, req);
  }

  @Delete('grade-horarios/:id')
  @HttpCode(204)
  @Roles('Admin')
  deletarGradeHorario(@Param('id') id: string, @Req() req: Request) {
    return this.appointmentsService.deletarGradeHorario(id, req);
  }
}
