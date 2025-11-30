import { User } from 'src/modules/user/entity/user.entity';

/**
 * DTO for token response after successful authentication
 */
export class TokenResponseDto {
  accessToken: string;
  tokenType: string = 'Bearer';
  expiresIn: number;
}

/**
 * DTO for successful login/register response
 */
export class AuthResponseDto {
  user: User;
  token: TokenResponseDto;
}
