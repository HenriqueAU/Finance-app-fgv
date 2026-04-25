import {
  IsEmail,
  IsNumber,
  IsString,
  MaxLength,
  Min,
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

  @IsNumber()
  @Min(0)
  emergency_reserve!: number;
}
