import { Body, Controller, Get, HttpCode, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { PatientsService } from './patients.service';
import { CriarPacienteDto } from './dto/criar-paciente.dto';
import { AtualizarPacienteDto } from './dto/atualizar-paciente.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('pacientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Roles('Doctor', 'Receptionist', 'Admin')
  listar(@Req() req: Request) {
    return this.patientsService.listar(req);
  }

  @Get('cpf/:cpf')
  @Roles('Doctor', 'Receptionist', 'Admin')
  obterPorCpf(@Param('cpf') cpf: string, @Req() req: Request) {
    return this.patientsService.obterPorCpf(cpf, req);
  }

  @Get(':id')
  @Roles('Doctor', 'Receptionist', 'Admin')
  obterPorId(@Param('id') id: string, @Req() req: Request) {
    return this.patientsService.obterPorId(id, req);
  }

  @Post()
  @Roles('Receptionist', 'Admin')
  criar(@Body() dto: CriarPacienteDto, @Req() req: Request) {
    return this.patientsService.criar(dto, req);
  }

  @Put(':id')
  @Roles('Receptionist', 'Admin')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarPacienteDto, @Req() req: Request) {
    return this.patientsService.atualizar(id, dto, req);
  }

  @Patch(':id/desativar')
  @HttpCode(204)
  @Roles('Admin')
  desativar(@Param('id') id: string, @Req() req: Request) {
    return this.patientsService.desativar(id, req);
  }
}
