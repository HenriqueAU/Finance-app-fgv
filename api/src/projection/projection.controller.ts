import { Controller, Get, Post, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ProjectionService } from './projection.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBuyIntentionDto } from '../buy-intentions/dto/create-intention.dto';

interface AuthenticadedRequest extends Request {
  user: { id: string; email: string };
}

@Controller('projection')
@UseGuards(JwtAuthGuard)
export class ProjectionController {
  constructor(private readonly projectionService: ProjectionService) {}

  @Get('current')
  async getCurrent(@Request() req: AuthenticadedRequest) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return await this.projectionService.getMonthProjection(req.user.id, currentMonth);
  }

  @Get('range')
  async getRange(
    @Query('from') from: string,
    @Query('to') to: string,
    @Request() req: AuthenticadedRequest,
  ) {
    return await this.projectionService.getProjectionRange(req.user.id, from, to);
  }

  @Get('month/:month')
  async getByMonth(
    @Param('month') month: string,
    @Request() req: AuthenticadedRequest,
  ) {
    return await this.projectionService.getMonthProjection(req.user.id, month);
  }

  @Post('simulate')
  async simulate(
    @Body() dto: CreateBuyIntentionDto,
    @Request() req: AuthenticadedRequest,
  ) {
    return await this.projectionService.simulateIntention(
      req.user.id,
      dto.installment_amount,
      dto.months,
      dto.desired_start_month,
    );
  }
}