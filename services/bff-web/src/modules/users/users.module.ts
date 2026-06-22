import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HmacService } from '../../common/hmac/hmac.service';

@Module({
  imports: [HttpModule],
  controllers: [UsersController],
  providers: [UsersService, HmacService],
})
export class UsersModule {}
