import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

vi.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      session: {
        create: vi.fn(),
        deleteMany: vi.fn(),
        findUnique: vi.fn(),
      },
      $transaction: vi.fn((cb) => cb(mockPrisma)),
    };

    mockJwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
      signAsync: vi.fn().mockResolvedValue('mock-jwt-token'),
      verify: vi.fn(),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'jwt.accessSecret') return 'access-secret-12345';
        if (key === 'jwt.refreshSecret') return 'refresh-secret-12345';
        if (key === 'jwt.accessExpiresIn') return '15m';
        if (key === 'jwt.refreshExpiresIn') return '7d';
        return undefined;
      }),
    };

    service = new AuthService(mockPrisma, mockJwtService, mockConfigService);
  });

  it('should throw ConflictException if email already registered', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'existing-id',
      email: 'taken@cashdash.io',
      username: 'othername',
    });

    await expect(
      service.register({
        email: 'taken@cashdash.io',
        username: 'newname',
        password: 'Password123!',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw UnauthorizedException on invalid login password', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'user@cashdash.io',
      passwordHash: 'hashed-secret',
      status: UserStatus.ACTIVE,
      role: UserRole.USER,
      profile: {},
    });

    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      service.login({
        email: 'user@cashdash.io',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if user is banned', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'banned-user',
      email: 'banned@cashdash.io',
      passwordHash: 'hashed-secret',
      status: UserStatus.BANNED,
      role: UserRole.USER,
      profile: {},
    });

    await expect(
      service.login({
        email: 'banned@cashdash.io',
        password: 'Password123!',
      }),
    ).rejects.toThrow(new UnauthorizedException('Account has been banned'));
  });

  it('should successfully login active user with correct password (case-insensitive email)', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'active-user',
      email: 'active@cashdash.io',
      passwordHash: 'hashed-secret',
      status: UserStatus.ACTIVE,
      role: UserRole.USER,
      profile: { avatarUrl: null },
    });

    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    mockPrisma.session.create.mockResolvedValue({ id: 'sess-1' });

    const result = await service.login({
      email: 'ACTIVE@CASHDASH.IO',
      password: 'CorrectPassword123!',
    });

    expect(result).toHaveProperty('tokens');
    expect(result.tokens).toHaveProperty('accessToken');
    expect(result.tokens).toHaveProperty('refreshToken');
    expect(result.user).toHaveProperty('id', 'active-user');
  });
});
