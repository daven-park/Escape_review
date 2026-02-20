import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthProvider, AuthRepository, AuthUser, AuthUserWithSecrets } from './auth.repository';
import { RegisterDto } from './dto/register.dto';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  provider: AuthProvider;
}

export interface GoogleOAuthUser {
  email: string;
  name: string;
  avatar: string | null;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: AuthUser;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;
  private readonly bcryptSaltRounds: number;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.getOrThrow<string>('jwt.secret');
    this.jwtRefreshSecret = this.configService.getOrThrow<string>('jwt.refreshSecret');
    this.accessTokenExpiresIn = this.configService.get<string>('jwt.accessExpiresIn') ?? '1h';
    this.refreshTokenExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') ?? '30d';

    const configuredSaltRounds = this.configService.get<number>('auth.bcryptSaltRounds') ?? 12;
    this.bcryptSaltRounds =
      Number.isInteger(configuredSaltRounds) && configuredSaltRounds > 3
        ? configuredSaltRounds
        : 12;
  }

  async validateLocalUser(email: string, password: string): Promise<AuthUserWithSecrets> {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.authRepository.findByEmail(normalizedEmail);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async login(user: AuthUserWithSecrets): Promise<AuthResult> {
    const userData = this.toUser(user);
    const tokens = await this.issueTokens(userData);

    return {
      user: userData,
      tokens,
    };
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const normalizedEmail = this.normalizeEmail(dto.email);
    const existingUser = await this.authRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptSaltRounds);
    const createdUser = await this.authRepository.createLocalUser({
      email: normalizedEmail,
      name: dto.name.trim(),
      passwordHash,
    });

    const userData = this.toUser(createdUser);
    const tokens = await this.issueTokens(userData);

    return {
      user: userData,
      tokens,
    };
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.authRepository.findById(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userData = this.toUser(user);
    const tokens = await this.issueTokens(userData);

    return {
      user: userData,
      tokens,
    };
  }

  async googleLogin(googleUser: GoogleOAuthUser): Promise<AuthResult> {
    const upsertedUser = await this.authRepository.upsertGoogleUser({
      email: this.normalizeEmail(googleUser.email),
      name: googleUser.name,
      avatar: googleUser.avatar,
    });

    const userData = this.toUser(upsertedUser);
    const tokens = await this.issueTokens(userData);

    return {
      user: userData,
      tokens,
    };
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    await this.authRepository.updateRefreshTokenHash(userId, null);
    return { success: true };
  }

  private async issueTokens(user: AuthUser): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwtSecret,
        expiresIn: this.accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.jwtRefreshSecret,
        expiresIn: this.refreshTokenExpiresIn,
      }),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, this.bcryptSaltRounds);
    await this.authRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private toUser(user: AuthUserWithSecrets): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
