import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

const isProd = process.env['NODE_ENV'] === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  async register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const ip = req.ip;
    const { user, tokens } = await this.authService.register(dto, ip);
    res.cookie('refresh_token', tokens.refreshToken, COOKIE_OPTIONS);
    res.cookie('access_token', tokens.accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    return {
      success: true,
      data: { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
      message: 'Registration successful. Please verify your email.',
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const ip = req.ip;
    const ua = req.headers['user-agent'];
    const { user, tokens } = await this.authService.login(dto, ip, ua);
    res.cookie('refresh_token', tokens.refreshToken, COOKIE_OPTIONS);
    res.cookie('access_token', tokens.accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    return {
      success: true,
      data: { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
      message: 'Login successful',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken: string = req.cookies?.['refresh_token'] || (req.body as any)?.refreshToken || '';
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    res.clearCookie('refresh_token', { path: '/', sameSite: (isProd ? 'none' : 'lax') as any, secure: isProd });
    res.clearCookie('access_token', { path: '/', sameSite: (isProd ? 'none' : 'lax') as any, secure: isProd });
    return { success: true, message: 'Logged out successfully' };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using HttpOnly cookie or body' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken: string = req.cookies?.['refresh_token'] || (req.body as any)?.refreshToken || '';
    const ip = req.ip;
    const tokens = await this.authService.refreshTokens(refreshToken, ip);
    res.cookie('refresh_token', tokens.refreshToken, COOKIE_OPTIONS);
    res.cookie('access_token', tokens.accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    return {
      success: true,
      data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return {
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);
    return { success: true, message: 'Password reset successful' };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address with token' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto.token);
    return { success: true, message: 'Email verified successfully' };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  async getMe(@CurrentUser() user: User) {
    const { passwordHash: _ph, ...safeUser } = user;
    return { success: true, data: safeUser };
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all active sessions' })
  async getSessions(@CurrentUser('id') userId: string) {
    const sessions = await this.authService.getUserSessions(userId);
    return { success: true, data: sessions };
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Revoke a specific session' })
  async revokeSession(@CurrentUser('id') userId: string, @Param('id') sessionId: string) {
    await this.authService.revokeSession(userId, sessionId);
    return { success: true, message: 'Session revoked' };
  }
}
