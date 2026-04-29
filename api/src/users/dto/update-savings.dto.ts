import { IsNumber, Min } from 'class-validator';

export class UpdateSavingsDto {
  @IsNumber()
  @Min(0)
  savings!: number;
}
