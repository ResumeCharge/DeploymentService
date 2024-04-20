import { Logger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService, Logger],
  imports: [HttpModule],
  exports: [UsersService],
})
export class UsersModule {}
