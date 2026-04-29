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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto, @Request() req: AuthenticatedRequest) {
    return this.expensesService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.expensesService.findAll(req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.expensesService.update(id, req.user.id, dto);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.expensesService.toggle(id, req.user.id);
  }

  @Get('payments/:month')
  getPaymentsByMonth(
    @Param('month') month: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.expensesService.getPaymentsByMonth(req.user.id, month);
  }

  @Patch(':id/payments/:month/pay')
  pay(
    @Param('id') id: string,
    @Param('month') month: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.expensesService.pay(id, req.user.id, month);
  }

  @Patch(':id/payments/:month/unpay')
  unpay(
    @Param('id') id: string,
    @Param('month') month: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.expensesService.unpay(id, req.user.id, month);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.expensesService.remove(id, req.user.id);
  }
}
