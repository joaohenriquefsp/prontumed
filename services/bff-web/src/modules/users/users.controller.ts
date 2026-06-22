import { Body, Controller, Get, HttpCode, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { AlterarPerfilDto } from './dto/alterar-perfil.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@Req() req: Request) {
    return this.usersService.me(req);
  }

  @Get()
  @Roles('Admin')
  listar(@Req() req: Request) {
    return this.usersService.listar(req);
  }

  @Get(':id')
  @Roles('Admin')
  obterPorId(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.obterPorId(id, req);
  }

  @Post()
  @Roles('Admin')
  criar(@Body() dto: CriarUsuarioDto, @Req() req: Request) {
    return this.usersService.criar(dto, req);
  }

  @Patch(':id/perfil')
  @HttpCode(204)
  @Roles('Admin')
  alterarPerfil(@Param('id') id: string, @Body() dto: AlterarPerfilDto, @Req() req: Request) {
    return this.usersService.alterarPerfil(id, dto, req);
  }

  @Patch(':id/desativar')
  @HttpCode(204)
  @Roles('Admin')
  desativar(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.desativar(id, req);
  }
}
