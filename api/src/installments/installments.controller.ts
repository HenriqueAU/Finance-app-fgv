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
import { InstallmentsService } from './installments.service';
import { CreateInstallmentDto } from './dto/create-installment.dto';
import { UpdateInstallmentDto } from './dto/update-installment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

@Controller('installments')
@UseGuards(JwtAuthGuard)
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Post()
  create(
    @Body() dto: CreateInstallmentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.installmentsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.installmentsService.findAll(req.user.id);
  }

  @Get('active')
  findActive(@Request() req: AuthenticatedRequest) {
    return this.installmentsService.findActive(req.user.id);
  }

  @Get('month/:month')
  findByMonth(
    @Param('month') month: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.installmentsService.findByMonth(req.user.id, month);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInstallmentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.installmentsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.installmentsService.remove(id, req.user.id);
  }
}
