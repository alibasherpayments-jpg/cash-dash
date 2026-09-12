import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: User) {
    const data = await this.usersService.findById(user.id);
    return { success: true, data };
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    const data = await this.usersService.updateProfile(userId, dto);
    return { success: true, data };
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(userId, dto);
    return { success: true, message: 'Password updated. Please log in again.' };
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get user stats (offers completed, referrals, streak)' })
  async getStats(@CurrentUser('id') userId: string) {
    const data = await this.usersService.getStats(userId);
    return { success: true, data };
  }

  @Get('me/notifications/preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  async getNotifPrefs(@CurrentUser('id') userId: string) {
    const data = await this.usersService.getNotificationPreferences(userId);
    return { success: true, data };
  }

  @Put('me/notifications/preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  async updateNotifPrefs(
    @CurrentUser('id') userId: string,
    @Body() body: Partial<{
      rewardNotifications: boolean;
      withdrawalNotifications: boolean;
      referralNotifications: boolean;
      promotionalNotifications: boolean;
      systemNotifications: boolean;
      emailRewardNotifications: boolean;
      emailWithdrawalNotifications: boolean;
    }>,
  ) {
    const data = await this.usersService.updateNotificationPreferences(userId, body);
    return { success: true, data };
  }

  @Get(':username')
  @ApiOperation({ summary: 'Get public profile by username' })
  async getPublicProfile(@Param('username') username: string) {
    const data = await this.usersService.findByUsername(username);
    return { success: true, data };
  }
}
