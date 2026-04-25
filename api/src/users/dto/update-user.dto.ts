import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;
}
