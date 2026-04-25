import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateSalaryDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  payday?: number;
}
