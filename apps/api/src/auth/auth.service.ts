import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserRole, UserStatus } from '@prisma/client';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, ipAddress?: string): Promise<{ user: Record<string, unknown>; tokens: TokenPair }> {
    // Check for existing email or username
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });

    if (existing) {
      if (existing.email === dto.email) {
        throw new ConflictException('Email already in use');
      }
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Resolve referrer
    let referredById: string | undefined;
    if (dto.referralCode) {
      const referrer = await this.prisma.user.findUnique({
        where: { referralCode: dto.referralCode },
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    // Create user + wallet + profile + streak + notification prefs in transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          passwordHash,
          role: UserRole.USER,
          status: UserStatus.PENDING_VERIFICATION,
          referredById,
          wallet: {
            create: {
              availablePoints: 0,
              pendingPoints: 0,
              totalEarned: 0,
              totalWithdrawn: 0,
            },
          },
          profile: {
            create: {
              isLeaderboardVisible: true,
              isProfileVisible: true,
              emailNotifications: true,
              pushNotifications: false,
            },
          },
          userStreak: {
            create: {
              currentStreak: 0,
              longestStreak: 0,
              lastActiveAt: new Date(),
            },
          },
          notificationPref: {
            create: {
              rewardNotifications: true,
              withdrawalNotifications: true,
              referralNotifications: true,
              promotionalNotifications: false,
              systemNotifications: true,
              emailRewardNotifications: true,
              emailWithdrawalNotifications: true,
            },
          },
          riskAssessment: {
            create: {},
          },
        },
        include: { profile: true, wallet: true },
      });

      // Create referral record if applicable
      if (referredById) {
        await tx.referral.create({
          data: {
            referrerId: referredById,
            referredId: newUser.id,
            rewardGiven: false,
            rewardPoints: 0,
          },
        });
      }

      return newUser;
    });

    // In production: send verification email
    this.logger.log(`User registered: ${user.id}`);

    const tokens = await this.generateTokens(user.id, user.email, user.role, ipAddress);

    const { passwordHash: _ph, ...safeUser } = user;
    return { user: safeUser as Record<string, unknown>, tokens };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<{ user: Record<string, unknown>; tokens: TokenPair }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('Account has been banned');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account is suspended');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, ipAddress, userAgent);
    const { passwordHash: _ph, ...safeUser } = user;
    return { user: safeUser as Record<string, unknown>, tokens };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { refreshToken } });
  }

  async refreshTokens(refreshToken: string, ipAddress?: string): Promise<TokenPair> {
    // Verify the refresh token
    let payload: { sub: string; email: string; role: string };
    try {
      payload = this.jwtService.verify<{ sub: string; email: string; role: string }>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Check session exists
    const session = await this.prisma.session.findUnique({ where: { refreshToken } });
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException('Session expired');
    }

    // Rotate refresh token
    await this.prisma.session.delete({ where: { id: session.id } });
    return this.generateTokens(payload.sub, payload.email, payload.role as UserRole, ipAddress);
  }

  async verifyEmail(token: string): Promise<void> {
    // In production: decode token, verify, mark user as verified
    // For now: find user by a stored token (simplified)
    this.logger.log(`Email verification attempted with token: [REDACTED]`);
    // Mock: mark first pending user (in a real impl, token maps to userId)
    throw new BadRequestException('Email verification tokens not yet implemented in this environment');
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether email exists
      return;
    }
    // In production: generate reset token, store it, send email
    this.logger.log(`Password reset requested for user: ${user.id}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // In production: validate reset token, find user, update password
    this.logger.log(`Password reset attempted with token: [REDACTED]`);
    throw new BadRequestException('Password reset tokens not yet implemented in this environment');
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
      }),
    ]);

    // Store session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }
    await this.prisma.session.delete({ where: { id: sessionId } });
  }
}
