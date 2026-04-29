import { Body, Controller, Patch, Delete, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { UpdateEmergencyReserveDto } from './dto/update-emergency-reserve.dto';
import { UpdateSavingsDto } from './dto/update-savings.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  updateProfile(
    @Body() dto: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Patch('me/salary')
  updateSalary(
    @Body() dto: UpdateSalaryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.usersService.updateSalary(req.user.id, dto);
  }

  @Patch('me/emergency-reserve')
  updateEmergencyReserve(
    @Body() dto: UpdateEmergencyReserveDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.usersService.updateEmergencyReserve(req.user.id, dto);
  }

  @Patch('me/savings')
  updateSavings(@Body() dto: UpdateSavingsDto, @Request() req: AuthenticatedRequest) {
    return this.usersService.updateSavings(req.user.id, dto);
  }

  @Patch('me/password')
  updatePassword(@Body() dto: UpdatePasswordDto, @Request() req: AuthenticatedRequest) {
    return this.usersService.updatePassword(req.user.id, dto);
  }

  @Delete('me')
  deleteAccount(@Request() req: AuthenticatedRequest) {
    return this.usersService.deleteAccount(req.user.id);
  }
}
