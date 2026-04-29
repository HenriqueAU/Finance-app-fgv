import { Module, forwardRef } from '@nestjs/common';
import { ProjectionService } from './projection.service';
import { ExpensesModule } from '../expenses/expenses.module';
import { InstallmentsModule } from '../installments/installments.module';
import { UsersModule } from '../users/users.module';
import { CreditCardsModule } from '../credit-cards/credit-cards.module';
import { SnapshotsModule } from '../snapshots/snapshots.module';
import { ProjectionController } from './projection.controller';

@Module({
  imports: [
    ExpensesModule,
    InstallmentsModule,
    UsersModule,
    CreditCardsModule,
    forwardRef(() => SnapshotsModule),
  ],
  controllers: [ProjectionController],
  providers: [ProjectionService],
  exports: [ProjectionService],
})
export class ProjectionModule {}
