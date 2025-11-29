import { IsString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

/**
 * Create Profile DTO
 * Validates profile creation data
 */
export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  linkedTutor?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsArray()
  @IsOptional()
  interests?: string[];

  @IsArray()
  @IsOptional()
  preferences?: string[];

  @IsString()
  @IsNotEmpty()
  pace: string;

  @IsString()
  @IsNotEmpty()
  schedule: string;

  @IsString()
  @IsNotEmpty()
  difficulty: string;

  @IsArray()
  @IsOptional()
  goals?: string[];
}
