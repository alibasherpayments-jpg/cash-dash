import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateTicketDto, AddTicketMessageDto, UpdateTicketStatusDto } from './dto/support.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole, TicketStatus } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('support')
@ApiBearerAuth()
@Controller('support')
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Create a support ticket' })
  async createTicket(@CurrentUser() user: User, @Body() dto: CreateTicketDto) {
    const data = await this.supportService.createTicket(user.id, dto);
    return { success: true, data };
  }

  @Get('tickets')
  @ApiOperation({ summary: 'List support tickets (own for users, all for staff)' })
  async listTickets(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: TicketStatus,
  ) {
    const result = await this.supportService.listTickets(user.id, user.role, page, limit, status);
    return { success: true, ...result };
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket with messages' })
  async getTicket(@Param('id') id: string, @CurrentUser() user: User) {
    const data = await this.supportService.getTicket(id, user.id, user.role);
    return { success: true, data };
  }

  @Post('tickets/:id/messages')
  @ApiOperation({ summary: 'Add a message to a ticket' })
  async addMessage(
    @Param('id') ticketId: string,
    @CurrentUser() user: User,
    @Body() dto: AddTicketMessageDto,
  ) {
    const isStaff = user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT;
    const data = await this.supportService.addMessage(ticketId, user.id, dto, isStaff);
    return { success: true, data };
  }

  @Patch('tickets/:id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Update ticket status (staff only)' })
  async updateStatus(
    @Param('id') ticketId: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    await this.supportService.updateTicketStatus(ticketId, dto, adminId);
    return { success: true, message: 'Ticket status updated' };
  }
}
