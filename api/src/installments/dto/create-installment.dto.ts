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

export class CreateInstallmentDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  creditCardId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  description!: string;

  @IsNumber()
  @Min(0)
  installment_amount!: number;

  @IsInt()
  @Min(1)
  @Max(60)
  total_months!: number;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  //garante o formato YYYY-MM
  start_month!: string;
}
