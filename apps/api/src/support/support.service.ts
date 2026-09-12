import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus, UserRole } from '@prisma/client';
import { CreateTicketDto, AddTicketMessageDto, UpdateTicketStatusDto } from './dto/support.dto';
import { getPaginationParams, paginate } from '../common/dto/pagination.dto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createTicket(userId: string, dto: CreateTicketDto) {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.create({
        data: {
          userId,
          subject: dto.subject,
          category: dto.category,
          status: TicketStatus.OPEN,
        },
      });

      await tx.supportMessage.create({
        data: {
          ticketId: ticket.id,
          authorId: userId,
          isStaff: false,
          content: dto.message,
        },
      });

      return ticket;
    });
  }

  async listTickets(userId: string, userRole: UserRole, page = 1, limit = 20, status?: TicketStatus) {
    const { take, skip } = getPaginationParams(page, limit);
    const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.SUPPORT;

    const where = {
      ...(isAdmin ? {} : { userId }),
      ...(status && { status }),
    };

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          user: { select: { username: true, email: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return paginate(tickets, total, page, take);
  }

  async getTicket(id: string, userId: string, userRole: UserRole) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, email: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.SUPPORT;
    if (!isAdmin && ticket.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return ticket;
  }

  async addMessage(ticketId: string, authorId: string, dto: AddTicketMessageDto, isStaff: boolean) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (!isStaff && ticket.userId !== authorId) {
      throw new ForbiddenException('Access denied');
    }

    const message = await this.prisma.supportMessage.create({
      data: {
        ticketId,
        authorId,
        isStaff,
        content: dto.content,
      },
    });

    // Update ticket status
    const newStatus = isStaff ? TicketStatus.WAITING_FOR_USER : TicketStatus.IN_PROGRESS;
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: newStatus },
    });

    return message;
  }

  async updateTicketStatus(ticketId: string, dto: UpdateTicketStatusDto, adminId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: dto.status },
    });

    if (dto.message) {
      await this.prisma.supportMessage.create({
        data: {
          ticketId,
          authorId: adminId,
          isStaff: true,
          content: dto.message,
        },
      });
    }
  }
}
