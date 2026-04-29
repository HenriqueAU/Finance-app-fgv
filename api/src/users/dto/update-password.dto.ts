import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  current_password!: string;

  @IsString()
  @MinLength(6)
  new_password!: string;
}
