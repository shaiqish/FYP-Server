import { IsString, IsEmail, IsOptional } from 'class-validator';

/**
 * DTO for creating a user from Google OAuth
 */
export class CreateGoogleUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  googleId: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
