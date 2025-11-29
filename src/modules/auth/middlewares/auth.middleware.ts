import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Authentication Middleware
 * Note: This middleware currently performs no actual authentication
 * It should be replaced with proper JWT verification logic or removed
 * if authentication is handled entirely by guards
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // TODO: Implement proper authentication middleware
    // Currently, this middleware does nothing and should be removed
    // or properly implement token verification here

    this.logger.debug(`${req.method} ${req.path}`);
    next();
  }
}
