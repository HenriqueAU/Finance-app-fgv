import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { BuyIntentionsService } from './buy-intentions.service';
import { CreateBuyIntentionDto } from './dto/create-intention.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntentionStatus } from '../shared/types';

interface AuthenticadedRequest extends Request {
  user: { id: string; email: string };
}

@Controller('intentions')
@UseGuards(JwtAuthGuard)
export class BuyIntentionsController {
  constructor(private readonly intentionsService: BuyIntentionsService) {}

  @Post()
  create(
    @Body() createDto: CreateBuyIntentionDto,
    @Request() req: AuthenticadedRequest,
  ) {
    return this.intentionsService.create(createDto, req.user.id);
  }

  @Post('simulate')
  simulate(
    @Body() dto: CreateBuyIntentionDto,
    @Request() req: AuthenticadedRequest,
  ) {
    return this.intentionsService.simulateIntention(
      req.user.id,
      dto.installment_amount,
      dto.months,
      dto.desired_start_month,
    );
  }

  @Get()
  findAll(
    @Query('status') status: IntentionStatus,
    @Request() req: AuthenticadedRequest,
  ) {
    return this.intentionsService.findAll(req.user.id, status);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Request() req: AuthenticadedRequest) {
    return this.intentionsService.updateStatus(id, req.user.id, 'aprovada');
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: AuthenticadedRequest) {
    return this.intentionsService.updateStatus(id, req.user.id, 'cancelada');
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: CreateBuyIntentionDto,
    @Request() req: AuthenticadedRequest,
  ) {
    return this.intentionsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticadedRequest) {
    return this.intentionsService.remove(id, req.user.id);
  }
}
