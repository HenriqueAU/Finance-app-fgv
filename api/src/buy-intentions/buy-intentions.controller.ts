import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { BuyIntentionsService } from './buy-intentions.service';
import { CreateBuyIntentionDto } from './dto/create-intention.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticadedRequest extends Request {
  user: { id: string; email: string };
}

@Controller('intentions')
@UseGuards(JwtAuthGuard)
export class BuyIntentionsController {
  constructor(private readonly intentionsService: BuyIntentionsService) {}

  @Post()
  create(@Body() createDto: CreateBuyIntentionDto, @Request() req: AuthenticadedRequest) {
    return this.intentionsService.create(createDto, req.user.id);
  }

  @Post('simulate')
  simulate(@Body() dto: CreateBuyIntentionDto, @Request() req: AuthenticadedRequest) {
    return this.intentionsService.simulate(dto, req.user.id);
  }

  @Get()
  findAll(@Query('status') status: string, @Request() req: AuthenticadedRequest) {
    return this.intentionsService.findAll(req.user.id, status);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Request() req: AuthenticadedRequest) {
    return this.intentionsService.updateStatus(id, req.user.id, 'approved');
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: AuthenticadedRequest) {
    return this.intentionsService.updateStatus(id, req.user.id, 'cancelled');
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticadedRequest) {
    return this.intentionsService.remove(id, req.user.id);
  }
}