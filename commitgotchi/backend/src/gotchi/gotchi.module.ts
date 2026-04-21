import { Module } from '@nestjs/common';
import { GotchiController } from './gotchi.controller';
import { GotchiService } from './gotchi.service';

@Module({
  controllers: [GotchiController],
  providers: [GotchiService],
  exports: [GotchiService],
})
export class GotchiModule {}
