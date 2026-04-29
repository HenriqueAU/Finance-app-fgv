import { IsNumber, IsString, Min, Matches } from 'class-validator';

export class CreateCardPaymentDto {
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  month!: string;

  @IsNumber()
  @Min(0)
  amount_paid!: number;
}
