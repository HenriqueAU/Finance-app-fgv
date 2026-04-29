import {
  IsEmail,
  IsNumber,
  IsString,
  IsInt,
  MaxLength,
  Min,
  Max,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password!: string;

  @IsNumber()
  @Min(0)
  salary!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  payday?: number;

  @IsNumber()
  @Min(0)
  emergency_reserve!: number;
}
