import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthProvider } from '../auth.repository';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  provider: AuthProvider;
}

export interface JwtUser {
  id: string;
  email: string;
  name: string;
  provider: AuthProvider;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
    });
  }

  validate(payload: JwtPayload): JwtUser {
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      provider: payload.provider,
    };
  }
}
