import { Module } from '@nestjs/common';
import { ProjectionService } from './projection.service';
import { ExpensesModule } from '../expenses/expenses.module';
import { InstallmentsModule } from '../installments/installments.module';
import { UsersModule } from '../users/users.module';
import { ProjectionController } from './projection.controller';

@Module({
  imports: [ExpensesModule, InstallmentsModule, UsersModule],
  controllers: [ProjectionController],
  providers: [ProjectionService],
  exports: [ProjectionService],
})
export class ProjectionModule {}
