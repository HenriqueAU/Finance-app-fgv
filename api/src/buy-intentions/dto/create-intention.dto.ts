import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBuyIntentionDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  description!: string;

  @IsNumber()
  @Min(0)
  installment_amount!: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsInt()
  @Min(1)
  @Max(60)
  months!: number;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month must be in YYYY-MM format',
  })
  desired_start_month!: string;
}
