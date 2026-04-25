import { IsNumber, Min } from 'class-validator';

export class UpdateEmergencyReserveDto {
  @IsNumber()
  @Min(0)
  emergency_reserve!: number;
}
