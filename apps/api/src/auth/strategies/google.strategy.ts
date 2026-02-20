import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

import { GoogleOAuthUser } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('google.clientId'),
      clientSecret: configService.getOrThrow<string>('google.clientSecret'),
      callbackURL: configService.getOrThrow<string>('google.callbackUrl'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): GoogleOAuthUser {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase();

    if (!email) {
      throw new UnauthorizedException('Google account email not available');
    }

    const displayName = profile.displayName?.trim();
    const fallbackName = [profile.name?.givenName, profile.name?.familyName]
      .filter((item): item is string => Boolean(item))
      .join(' ')
      .trim();

    return {
      email,
      name: displayName || fallbackName || email.split('@')[0],
      avatar: profile.photos?.[0]?.value ?? null,
    };
  }
}
