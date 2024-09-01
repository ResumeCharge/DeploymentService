import { Logger, Module } from '@nestjs/common';
import { StaticAssetsService } from './static-assets.service';

@Module({
  providers: [StaticAssetsService, Logger],
  exports: [StaticAssetsService],
})
export class StaticAssetsModule {}
