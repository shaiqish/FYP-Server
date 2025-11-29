import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user-dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiResponse } from 'src/common/dto/api-response.dto';

/**
 * User Controller
 * Handles user profile operations and management
 */
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get all users
   */
  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return ApiResponse.success('Users retrieved successfully', users);
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOneById(id);
    return ApiResponse.success('User retrieved successfully', user);
  }

  /**
   * Get current authenticated user
   */
  @Get('profile/me')
  @UseGuards(AuthGuard)
  async getCurrentUser(@Request() req: any) {
    const user = await this.userService.findOneById(req.user.id);
    return ApiResponse.success('Current user retrieved', user);
  }

  /**
   * Update user information
   */
  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    return ApiResponse.success('User updated successfully', user);
  }

  /**
   * Delete user
   */
  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    const result = await this.userService.delete(id);
    return ApiResponse.success('User deleted successfully', result);
  }
}
