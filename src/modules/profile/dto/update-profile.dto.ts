import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create-profile.dto';

/**
 * Update Profile DTO
 * Extends CreateProfileDto with all fields optional for partial updates
 */
export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
