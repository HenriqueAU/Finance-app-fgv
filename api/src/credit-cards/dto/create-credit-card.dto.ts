import {
  IsInt,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCreditCardDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  name!: string;

  @IsNumber()
  @Min(0)
  limit!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  billing_cycle_day!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  payment_due_day!: number;
}
