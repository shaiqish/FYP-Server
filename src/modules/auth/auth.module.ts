import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from 'src/common/services/email.service';
import { AuthGuard } from './guards/auth.guard';

/**
 * Auth Module
 * Handles authentication, JWT tokens, and OAuth flows
 */
@Module({
  imports: [
    ConfigModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, AuthGuard],
  exports: [AuthService, AuthGuard, JwtModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply auth middleware only to auth routes for logging
    consumer.apply(AuthMiddleware).forRoutes('auth');
  }
}
