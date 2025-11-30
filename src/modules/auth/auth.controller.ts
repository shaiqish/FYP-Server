import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user-dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApiResponse } from 'src/common/dto/api-response.dto';
import { Response } from 'express';

/**
 * Authentication Controller
 * Handles user registration, login, and OAuth flows
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const result = await this.authService.register(createUserDto);

    return ApiResponse.success('User registered successfully', result);
  }

  /**
   * Login user with email and password
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    return ApiResponse.success('Login successful', result);
  }

  /**
   * Get current authenticated user
   */
  @Get('user')
  @UseGuards(AuthGuard)
  getUser(@Request() req: any) {
    return ApiResponse.success('User retrieved', req.user);
  }

  /**
   * Admin endpoint (requires moderator role)
   */
  @Get('admin')
  @Roles('moderator')
  @UseGuards(RolesGuard)
  getAdmin() {
    return ApiResponse.success('Admin access granted', {
      message: 'This is admin endpoint',
    });
  }

  /**
   * Redirect to Google OAuth login
   */
  @Get('google')
  redirectToGoogle(@Res() res: Response) {
    const url = this.authService.getGoogleOAuthURL();
    return res.redirect(url);
  }

  /**
   * Handle Google OAuth callback
   */
  @Get('google/callback')
  async handleGoogleCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    try {
      const result = await this.authService.handleGoogleCallback(code);
      return res.json(ApiResponse.success('Google OAuth successful', result));
    } catch (error) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            'Google OAuth failed',
            error instanceof Error ? error.message : 'Unknown error',
          ),
        );
    }
  }

  /**
   * Request password reset email
   */
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(
      forgotPasswordDto.email,
    );
    return ApiResponse.success(result.message, result);
  }

  /**
   * Reset password with reset token
   */
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    return ApiResponse.success(result.message, result);
  }
}
