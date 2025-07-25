import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user-dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthService {
  private clientID: string;
  private clientSecret: string;
  private redirectURI: string;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private config: ConfigService,
  ) {
    this.clientID = this.config.get<string>('GOOGLE_CLIENT_ID')!;
    this.clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET')!;
    this.redirectURI = this.config.get<string>('GOOGLE_REDIRECT_URI')!;
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return this.generateToken(user);
  }

  async login(createUserDto: CreateUserDto) {
    const user = await this.userService.validateUser(
      createUserDto.email,
      createUserDto.password,
    );
    return this.generateToken(user);
  }

  async generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  //OAuth services from here

  getGoogleOAuthURL(): string {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: this.redirectURI,
      client_id: this.clientID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: ['openid', 'profile', 'email'].join(' '),
    };
    const qs = new URLSearchParams(options).toString();
    return `${rootUrl}?${qs}`;
  }

  async handleGoogleCallback(code: string) {
    // 1) Exchange code for tokens
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: this.clientID,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectURI,
        grant_type: 'authorization_code',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const { id_token, access_token } = tokenRes.data;

    // 2) Fetch user info
    const userRes = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } },
    );
    const googleUser = userRes.data;

    // 3) Here you’d typically upsert the user into your DB...
    // const user = await this.userService.findOrCreate({...})

    return {
      message: 'Google OAuth successful',
      user: {
        id: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      },
      tokens: { id_token, access_token },
    };
  }

  // (Optional) Issue your own JWT after validating/creating user:
  // signJwt(payload: any) {
  //   return this.jwtService.sign(payload, {
  //     secret: this.config.get('JWT_SECRET'),
  //   });
  // }
}
