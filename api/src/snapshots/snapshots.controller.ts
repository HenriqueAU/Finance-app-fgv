import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { SnapshotsService } from './snapshots.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller('snapshots')
export class SnapshotsController {
  constructor(private readonly snapshotsService: SnapshotsService) {}

  @Get('current')
  async getCurrent(@Request() req: AuthenticatedRequest) {
    return this.snapshotsService.findCurrent(req.user.id);
  }

  @Get(':month')
  async getByMonth(
    @Request() req: AuthenticatedRequest,
    @Param('month') month: string,
  ) {
    return this.snapshotsService.findByMonth(req.user.id, month);
  }
}
