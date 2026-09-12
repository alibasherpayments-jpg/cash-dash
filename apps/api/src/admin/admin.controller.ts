import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole, AuditAction, WithdrawalStatus, OfferStatus, OfferCategory } from '@prisma/client';
import {
  AdminAdjustBalanceDto,
  AdminUpdateUserStatusDto,
  AdminBroadcastNotificationDto,
  AdminUpdateSettingDto,
  CreateOfferProviderDto,
  UpdateOfferProviderDto,
} from './dto/admin.dto';
import { CreateOfferDto, UpdateOfferDto } from '../offers/dto/offers.dto';
import {
  CreateWithdrawalMethodDto,
  CreateWithdrawalRequirementDto,
  UpdateWithdrawalStatusDto,
} from '../withdrawals/dto/withdrawals.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  async getStats() {
    const data = await this.adminService.getDashboardStats();
    return { success: true, data };
  }

  // ─── Users ─────────────────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'List all users with search and filters' })
  async listUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('role') role?: string,
  ) {
    const result = await this.adminService.listUsers({ page, limit, search, status, role });
    return { success: true, ...result };
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  async getUser(@Param('id') id: string) {
    const data = await this.adminService.getUserDetail(id);
    return { success: true, data };
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status (suspend/ban/activate)' })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() dto: AdminUpdateUserStatusDto,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    await this.adminService.updateUserStatus(userId, dto, adminId, req.ip);
    return { success: true, message: 'User status updated' };
  }

  @Post('users/:id/adjust-balance')
  @ApiOperation({ summary: 'Admin balance adjustment with audit log' })
  async adjustBalance(
    @Param('id') userId: string,
    @Body() dto: AdminAdjustBalanceDto,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    await this.adminService.adjustBalance(userId, dto, adminId, req.ip);
    return { success: true, message: 'Balance adjusted' };
  }

  @Get('users/:id/notes')
  @ApiOperation({ summary: 'Get admin notes for a user' })
  async getUserNotes(@Param('id') userId: string) {
    const data = await this.adminService.getUserNotes(userId);
    return { success: true, data };
  }

  @Post('users/:id/notes')
  @ApiOperation({ summary: 'Add admin note to a user' })
  async addUserNote(
    @Param('id') userId: string,
    @Body('content') content: string,
    @CurrentUser('id') adminId: string,
  ) {
    const data = await this.adminService.addUserNote(userId, adminId, content);
    return { success: true, data };
  }

  @Get('users/:id/risk')
  @ApiOperation({ summary: 'Get fraud/risk assessment for a user' })
  async getUserRisk(@Param('id') userId: string) {
    const data = await this.adminService.getUserRisk(userId);
    return { success: true, data };
  }

  // ─── Offers ────────────────────────────────────────────────────────────────

  @Get('offers')
  @ApiOperation({ summary: 'List all offers (admin)' })
  async listOffers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: OfferStatus,
    @Query('category') category?: OfferCategory,
  ) {
    const result = await this.adminService.listOffers({ page, limit, search, status, category });
    return { success: true, ...result };
  }

  @Get('offers/:id')
  @ApiOperation({ summary: 'Get offer details' })
  async getOffer(@Param('id') id: string) {
    const data = await this.adminService.getOffer(id);
    return { success: true, data };
  }

  @Post('offers')
  @ApiOperation({ summary: 'Create a new offer' })
  async createOffer(@Body() dto: CreateOfferDto, @CurrentUser('id') adminId: string, @Req() req: Request) {
    const data = await this.adminService.createOffer(dto, adminId, req.ip);
    return { success: true, data };
  }

  @Put('offers/:id')
  @ApiOperation({ summary: 'Update an offer' })
  async updateOffer(
    @Param('id') id: string,
    @Body() dto: UpdateOfferDto,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    const data = await this.adminService.updateOffer(id, dto, adminId, req.ip);
    return { success: true, data };
  }

  @Delete('offers/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete (deactivate) an offer' })
  async deleteOffer(@Param('id') id: string, @CurrentUser('id') adminId: string, @Req() req: Request) {
    await this.adminService.deleteOffer(id, adminId, req.ip);
    return { success: true, message: 'Offer deactivated' };
  }

  // ─── Providers ─────────────────────────────────────────────────────────────

  @Get('providers')
  @ApiOperation({ summary: 'List all offer providers' })
  async listProviders() {
    const data = await this.adminService.listProviders();
    return { success: true, data };
  }

  @Get('providers/:id')
  @ApiOperation({ summary: 'Get provider details' })
  async getProvider(@Param('id') id: string) {
    const data = await this.adminService.getProvider(id);
    return { success: true, data };
  }

  @Post('providers')
  @ApiOperation({ summary: 'Create a new offerwall/survey provider' })
  async createProvider(
    @Body() dto: CreateOfferProviderDto,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    const data = await this.adminService.createProvider(dto, adminId, req.ip);
    return { success: true, data };
  }

  @Patch('providers/:id')
  @ApiOperation({ summary: 'Update provider config' })
  async updateProvider(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    const data = await this.adminService.updateProvider(id, body, adminId, req.ip);
    return { success: true, data };
  }

  @Delete('providers/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an offerwall provider' })
  async deleteProvider(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    await this.adminService.deleteProvider(id, adminId, req.ip);
    return { success: true, message: 'Provider deleted' };
  }

  // ─── Withdrawals ───────────────────────────────────────────────────────────

  @Get('withdrawals')
  @ApiOperation({ summary: 'List all withdrawals with filters' })
  async listWithdrawals(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    const result = await this.adminService.listWithdrawals({ page, limit, status, userId });
    return { success: true, ...result };
  }

  @Get('withdrawals/:id')
  @ApiOperation({ summary: 'Get withdrawal details' })
  async getWithdrawal(@Param('id') id: string) {
    const data = await this.adminService.getWithdrawal(id);
    return { success: true, data };
  }

  @Patch('withdrawals/:id/status')
  @ApiOperation({ summary: 'Update withdrawal status' })
  async updateWithdrawalStatus(
    @Param('id') id: string,
    @Body() dto: UpdateWithdrawalStatusDto,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    const data = await this.adminService.updateWithdrawalStatus(id, dto, adminId, req.ip);
    return { success: true, data };
  }

  // ─── Withdrawal Methods ────────────────────────────────────────────────────

  @Get('withdrawal-methods')
  @ApiOperation({ summary: 'List all withdrawal methods (incl. inactive)' })
  async listMethods() {
    const data = await this.adminService.listWithdrawalMethods();
    return { success: true, data };
  }

  @Post('withdrawal-methods')
  @ApiOperation({ summary: 'Create a withdrawal method' })
  async createMethod(@Body() dto: CreateWithdrawalMethodDto, @CurrentUser('id') adminId: string, @Req() req: Request) {
    const data = await this.adminService.createWithdrawalMethod(dto, adminId, req.ip);
    return { success: true, data };
  }

  @Put('withdrawal-methods/:id')
  @ApiOperation({ summary: 'Update a withdrawal method' })
  async updateMethod(
    @Param('id') id: string,
    @Body() dto: Partial<CreateWithdrawalMethodDto>,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    const data = await this.adminService.updateWithdrawalMethod(id, dto, adminId, req.ip);
    return { success: true, data };
  }

  @Delete('withdrawal-methods/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete (deactivate) a withdrawal method' })
  async deleteMethod(@Param('id') id: string, @CurrentUser('id') adminId: string, @Req() req: Request) {
    await this.adminService.deleteWithdrawalMethod(id, adminId, req.ip);
    return { success: true, message: 'Withdrawal method deactivated' };
  }

  @Post('withdrawal-methods/:id/requirements')
  @ApiOperation({ summary: 'Add a requirement to a withdrawal method' })
  async addRequirement(@Param('id') methodId: string, @Body() dto: CreateWithdrawalRequirementDto) {
    const data = await this.adminService.addWithdrawalRequirement(methodId, dto);
    return { success: true, data };
  }

  @Delete('withdrawal-methods/requirements/:requirementId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a withdrawal requirement' })
  async deleteRequirement(@Param('requirementId') id: string) {
    await this.adminService.deleteWithdrawalRequirement(id);
    return { success: true, message: 'Requirement deleted' };
  }

  // ─── Notifications ─────────────────────────────────────────────────────────

  @Post('notifications/broadcast')
  @ApiOperation({ summary: 'Broadcast notification to all or specific users' })
  async broadcast(@Body() dto: AdminBroadcastNotificationDto, @CurrentUser('id') adminId: string, @Req() req: Request) {
    await this.adminService.broadcastNotification(dto, adminId, req.ip);
    return { success: true, message: 'Notification broadcast queued' };
  }

  // ─── Settings ──────────────────────────────────────────────────────────────

  @Get('settings')
  @ApiOperation({ summary: 'Get all system settings' })
  async getSettings() {
    const data = await this.adminService.getAllSettings();
    return { success: true, data };
  }

  @Put('settings/:key')
  @ApiOperation({ summary: 'Update a system setting' })
  async updateSetting(
    @Param('key') key: string,
    @Body() dto: AdminUpdateSettingDto,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    await this.adminService.updateSetting(key, dto.value, adminId, req.ip);
    return { success: true, message: 'Setting updated' };
  }

  // ─── Audit Logs ────────────────────────────────────────────────────────────

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get paginated audit logs' })
  async getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('action') action?: AuditAction,
    @Query('entityType') entityType?: string,
  ) {
    const result = await this.adminService.getAuditLogs({ page, limit, action, entityType });
    return { success: true, ...result };
  }
}
