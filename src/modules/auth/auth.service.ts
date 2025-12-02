import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user-dto';
import { ConfigService } from '@nestjs/config';
import {
  InvalidCredentialsException,
  InvalidTokenException,
} from 'src/common/exceptions/custom.exception';
import { AuthResponseDto } from './dto/auth-response.dto';
import { EmailService } from 'src/common/services/email.service';
import { randomBytes } from 'crypto';

/**
 * Service responsible for authentication logic including registration, login, and JWT operations
 */
@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string = '1d';

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
  }

  /**
   * Register a new user and return authentication token
   */
  async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    const user = await this.userService.create(createUserDto);
    return this.generateAuthResponse(user);
  }

  /**
   * Authenticate user with email and password
   */
  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new InvalidCredentialsException();
    }
    return this.generateAuthResponse(user);
  }

  /**
   * Generate JWT token for user
   */
  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiresIn,
    });
  }

  /**
   * Generate complete auth response with token information
   */
  private generateAuthResponse(user: any): AuthResponseDto {
    const token = this.generateToken(user.id, user.email);
    const decoded = this.jwtService.decode(token) as any;

    return {
      user: user,
      token: {
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn: decoded.exp - Math.floor(Date.now() / 1000),
      },
    };
  }

  /**
   * Verify JWT token and return payload
   */
  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token, { secret: this.jwtSecret });
    } catch {
      throw new InvalidTokenException();
    }
  }

  /**
   * Get Google OAuth URL for redirect
   */
  getGoogleOAuthURL(): string {
    const clientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectURI = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientID || !redirectURI) {
      throw new Error('Google OAuth credentials not configured');
    }

    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: redirectURI,
      client_id: clientID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: ['openid', 'profile', 'email'].join(' '),
    };

    const qs = new URLSearchParams(options).toString();
    return `${rootUrl}?${qs}`;
  }

  /**
   * Handle Google OAuth callback and return user data
   * Exchanges authorization code for tokens and creates/updates user
   */
  async handleGoogleCallback(code: string): Promise<AuthResponseDto> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Google OAuth credentials not configured');
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Failed to exchange code for tokens: ${error}`);
    }

    const tokens = await tokenResponse.json();

    // Fetch user info from Google
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info from Google');
    }

    const googleUser = await userInfoResponse.json();

    // Find or create user
    let user;
    try {
      user = await this.userService.findByEmail(googleUser.email);
    } catch {
      // User doesn't exist, create new one
      user = await this.userService.createGoogleUser({
        email: googleUser.email,
        firstName:
          googleUser.given_name || googleUser.name?.split(' ')[0] || 'User',
        lastName:
          googleUser.family_name || googleUser.name?.split(' ')[1] || '',
        googleId: googleUser.id,
        avatarUrl: googleUser.picture,
      });
    }

    return this.generateAuthResponse(user);
  }

  /**
   * Generate password reset token and send email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(email);

    // Generate secure random token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(
      resetTokenExpiry.getHours() +
        parseInt(
          this.configService.get<string>('RESET_PASSWORD_EXPIRY') || '1',
          10,
        ),
    );

    // Update user with reset token
    await this.userService.updatePasswordResetToken(
      user.id,
      resetToken,
      resetTokenExpiry,
    );

    // Send reset email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.profile?.firstName || 'User',
      resetToken,
    );

    return { message: 'Password reset email sent successfully' };
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userService.findByResetToken(token);

    // Verify token hasn't expired
    if (
      !user.passwordResetTokenExpires ||
      new Date() > user.passwordResetTokenExpires
    ) {
      throw new InvalidTokenException('Password reset token has expired');
    }

    // Update user password and clear reset token
    await this.userService.updatePassword(user.id, newPassword);
    await this.userService.clearPasswordResetToken(user.id);

    // Send confirmation email
    await this.emailService.sendPasswordChangedEmail(
      user.email,
      user.profile?.firstName || 'User',
    );

    return { message: 'Password reset successfully' };
  }
}
