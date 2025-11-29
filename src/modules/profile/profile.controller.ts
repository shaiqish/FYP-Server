import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiResponse } from 'src/common/dto/api-response.dto';

/**
 * Profile Controller
 * Handles user profile operations
 */
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Get all profiles
   */
  @Get()
  async findAll() {
    const profiles = await this.profileService.findAll();
    return ApiResponse.success('Profiles retrieved successfully', profiles);
  }

  /**
   * Get profile by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const profile = await this.profileService.findOneById(id);
    return ApiResponse.success('Profile retrieved successfully', profile);
  }

  /**
   * Get current authenticated user's profile
   */
  @Get('user/me')
  @UseGuards(AuthGuard)
  async getMyProfile(@Request() req: any) {
    const profile = await this.profileService.findByUserId(req.user.id);
    return ApiResponse.success('Current user profile retrieved', profile);
  }

  /**
   * Create a new profile
   */
  @Post()
  @HttpCode(201)
  async create(@Body() createProfileDto: CreateProfileDto) {
    const profile = await this.profileService.create(createProfileDto);
    return ApiResponse.success('Profile created successfully', profile);
  }

  /**
   * Update profile information
   */
  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const profile = await this.profileService.update(id, updateProfileDto);
    return ApiResponse.success('Profile updated successfully', profile);
  }
}
