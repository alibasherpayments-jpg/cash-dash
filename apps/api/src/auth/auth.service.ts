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
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { RegisterDto, LoginDto, GoogleAuthDto } from './dto/auth.dto';
import { UserRole, UserStatus } from '@prisma/client';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const clientId =
      this.configService.get<string>('GOOGLE_CLIENT_ID') ||
      '219845067052-r4t9s9qfor0bi7q46etc01fejtps4q2r.apps.googleusercontent.com';
    this.googleClient = new OAuth2Client(clientId);
  }

  async register(dto: RegisterDto, ipAddress?: string): Promise<{ user: Record<string, unknown>; tokens: TokenPair }> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedUsername = dto.username.trim();

    // Check for existing email or username (case-insensitive)
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: normalizedEmail, mode: 'insensitive' } },
          { username: { equals: normalizedUsername, mode: 'insensitive' } },
        ],
      },
    });

    if (existing) {
      if (existing.email.toLowerCase() === normalizedEmail) {
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
          email: normalizedEmail,
          username: normalizedUsername,
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
    const normalizedEmail = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
      },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Auto-normalize stored email if it previously had uppercase characters
    if (user.email !== normalizedEmail) {
      try {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { email: normalizedEmail },
        });
        user.email = normalizedEmail;
      } catch (err: any) {
        this.logger.warn(`Could not update user ${user.id} email to lowercase: ${err.message}`);
      }
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

  async googleAuth(
    dto: GoogleAuthDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ user: Record<string, unknown>; tokens: TokenPair }> {
    const clientId =
      this.configService.get<string>('GOOGLE_CLIENT_ID') ||
      '219845067052-r4t9s9qfor0bi7q46etc01fejtps4q2r.apps.googleusercontent.com';

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (err: any) {
      this.logger.error(`Google token verification failed: ${err.message}`);
      throw new UnauthorizedException('Invalid or expired Google token');
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Google account did not return a valid email address');
    }

    const googleId = payload.sub;
    const normalizedEmail = payload.email.trim().toLowerCase();
    const name = payload.name || payload.given_name || normalizedEmail.split('@')[0];
    const picture = payload.picture;

    // Check if user already exists by googleId or email
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email: { equals: normalizedEmail, mode: 'insensitive' } },
        ],
      },
      include: { profile: true, wallet: true },
    });

    if (user) {
      if (user.status === UserStatus.BANNED) {
        throw new UnauthorizedException('Account has been banned');
      }

      // Link googleId or auto-verify email if not already set
      const updateData: any = {};
      if (!user.googleId) updateData.googleId = googleId;
      if (!user.emailVerifiedAt) updateData.emailVerifiedAt = new Date();
      if (user.status === UserStatus.PENDING_VERIFICATION) updateData.status = UserStatus.ACTIVE;

      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: updateData,
          include: { profile: true, wallet: true },
        });
      }

      // Update avatar if profile doesn't have one
      if (picture && user.profile && !user.profile.avatarUrl) {
        await this.prisma.profile.update({
          where: { userId: user.id },
          data: { avatarUrl: picture },
        });
      }

      this.logger.log(`User logged in via Google: ${user.username} (${user.id})`);
    } else {
      // Generate clean unique username
      let baseUsername = name.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 14);
      if (baseUsername.length < 3) {
        baseUsername = 'user_' + Math.random().toString(36).substring(2, 7);
      }
      let username = baseUsername;
      let counter = 1;
      while (await this.prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Secure random password hash
      const randomSecret = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomSecret, 12);

      // Resolve referrer if referralCode passed
      let referredById: string | undefined;
      if (dto.referralCode) {
        const referrer = await this.prisma.user.findUnique({
          where: { referralCode: dto.referralCode.trim() },
        });
        if (referrer) {
          referredById = referrer.id;
        }
      }

      user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: normalizedEmail,
            username,
            passwordHash,
            googleId,
            role: UserRole.USER,
            status: UserStatus.ACTIVE,
            emailVerifiedAt: new Date(),
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
                avatarUrl: picture || null,
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

      this.logger.log(`New user registered via Google: ${user.username} (${user.id})`);
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
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });
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
