import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyIntentionsService } from './buy-intentions.service';
import { BuyIntentionsController } from './buy-intentions.controller';
import { buyIntention } from './entities/buyIntention.entity';
import { ProjectionModule } from '../projection/projection.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([buyIntention]),
    ProjectionModule
  ],
  controllers: [BuyIntentionsController],
  providers: [BuyIntentionsService],
  exports: [BuyIntentionsService],
})
export class BuyIntentionsModule {}