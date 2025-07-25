import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const user = {
      id: '0de3ef33-b1fd-448f-8d0a-301f2adca648',
      email: 'shaiq@gmail.com',
      password: 'changeme',
    };
    req.user = user;
    next();
  }
}
