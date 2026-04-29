import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCardPaymentDto } from './dto/create-card-payment.dto';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

@Controller('credit-cards')
@UseGuards(JwtAuthGuard)
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  @Post()
  create(
    @Body() dto: CreateCreditCardDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.creditCardsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.creditCardsService.findAll(req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCreditCardDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.creditCardsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.creditCardsService.remove(id, req.user.id);
  }
  @Get(':id/usage/:month')
  getUsage(
    @Param('id') id: string,
    @Param('month') month: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.creditCardsService.getUsage(id, req.user.id, month);
  }

  @Post(':id/payments')
  registerPayment(
    @Param('id') id: string,
    @Body() dto: CreateCardPaymentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.creditCardsService.registerPayment(id, req.user.id, dto);
  }

  @Get(':id/payments')
  getPayments(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.creditCardsService.getPayments(id, req.user.id);
  }
}
