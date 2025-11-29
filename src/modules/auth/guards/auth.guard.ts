import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InvalidTokenException } from 'src/common/exceptions/custom.exception';

/**
 * Authentication Guard
 * Verifies JWT token from Authorization header and attaches user to request
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly jwtSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token: string | undefined = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new InvalidTokenException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtSecret,
      });

      req.user = {
        id: payload.sub,
        email: payload.email,
      };

      return true;
    } catch {
      throw new InvalidTokenException();
    }
  }
}
