import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhooksController } from './webhooks.controller';
import { HttpStatus } from '@nestjs/common';
import { OfferCompletionStatus, Prisma } from '@prisma/client';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let mockPrisma: any;
  let mockProviderRegistry: any;
  let mockWalletService: any;
  let mockNotificationsService: any;
  let mockTelegramService: any;

  const mockProvider = {
    id: 'prov-mooffers',
    name: 'MoOffers',
    slug: 'mooffers',
    isActive: true,
    webhookSecret: 'sec_test_123',
  };

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockOffer = {
    id: 'offer-123',
    providerId: 'prov-mooffers',
    externalId: 'mo-task-1',
    title: 'Test Offer',
    status: 'INACTIVE',
  };

  const mockCompletion = {
    id: 'comp-123',
    userId: 'user-123',
    offerId: 'offer-123',
    providerId: 'prov-mooffers',
    externalTxId: 'tx-123',
    rewardPoints: 70,
    status: OfferCompletionStatus.COMPLETED,
  };

  beforeEach(() => {
    mockPrisma = {
      offerProvider: {
        findFirst: vi.fn().mockResolvedValue(mockProvider),
        update: vi.fn().mockResolvedValue(mockProvider),
      },
      user: {
        findFirst: vi.fn().mockResolvedValue(mockUser),
      },
      offer: {
        findFirst: vi.fn().mockResolvedValue(mockOffer),
        create: vi.fn().mockResolvedValue(mockOffer),
        update: vi.fn().mockResolvedValue(mockOffer),
      },
      offerCompletion: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(mockCompletion),
      },
      providerWebhookEvent: {
        upsert: vi.fn().mockResolvedValue({}),
      },
    };

    mockProviderRegistry = {
      getProvider: vi.fn().mockReturnValue({
        validateWebhook: vi.fn().mockReturnValue(true),
      }),
    };

    mockWalletService = {
      credit: vi.fn().mockResolvedValue(undefined),
    };

    mockNotificationsService = {
      trigger: vi.fn().mockResolvedValue(undefined),
    };

    mockTelegramService = {
      sendRewardAlert: vi.fn().mockResolvedValue(true),
    };

    controller = new WebhooksController(
      mockPrisma,
      mockProviderRegistry,
      mockWalletService,
      mockNotificationsService,
      mockTelegramService,
    );
  });

  const createMockReqRes = (isJson = false) => {
    const req: any = {
      query: isJson ? { response_format: 'json' } : {},
      headers: isJson ? { accept: 'application/json' } : {},
    };
    const res: any = {
      statusCode: 200,
      body: null,
      status: vi.fn().mockImplementation(function (code) {
        res.statusCode = code;
        return res;
      }),
      send: vi.fn().mockImplementation(function (data) {
        res.body = data;
        return res;
      }),
      json: vi.fn().mockImplementation(function (data) {
        res.body = data;
        return res;
      }),
    };
    return { req, res };
  };

  it('should process a valid MoOffers GET postback and return plain text 1', async () => {
    const { req, res } = createMockReqRes(false);
    const query = {
      uid: 'user-123',
      payout: '0.10',
      conversion_no: 'conv-999',
      offer_id: 'mo-task-1',
      offer_name: 'Download Game',
      status: 'approved',
    };

    await controller.handleGetPostback('mooffers', query, '', '', '', '', '', req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.send).toHaveBeenCalledWith('1');
    expect(mockWalletService.credit).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        amount: 70, // 0.10 * 700
      }),
    );
  });

  it('should process a valid MoOffers POST JSON postback and return json', async () => {
    const { req, res } = createMockReqRes(true);
    const body = {
      uid: 'user-123',
      payout: '0.20',
      conversion_no: 'conv-1000',
      offer_id: 'mo-task-1',
      status: 'approved',
    };

    await controller.handlePostPostback('mooffers', {}, body, '', '', '', '', '', req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 0,
        status: 'success',
        credited: true,
        points: 140, // 0.20 * 700
        userId: 'user-123',
      }),
    );
  });

  it('should handle idempotent requests (already processed tx)', async () => {
    const { req, res } = createMockReqRes(true);
    mockPrisma.offerCompletion.findFirst.mockResolvedValueOnce(mockCompletion);

    const query = {
      uid: 'user-123',
      conversion_no: 'tx-123',
      payout: '0.10',
    };

    await controller.handleGetPostback('mooffers', query, '', '', '', '', '', req, res);

    expect(mockWalletService.credit).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        credited: false,
        message: 'Already processed',
      }),
    );
  });

  it('should gracefully handle unknown user without failing the postback', async () => {
    const { req, res } = createMockReqRes(true);
    mockPrisma.user.findFirst.mockResolvedValueOnce(null);

    const query = {
      uid: 'nonexistent-user',
      conversion_no: 'tx-unknown-user',
      payout: '0.10',
    };

    await controller.handleGetPostback('mooffers', query, '', '', '', '', '', req, res);

    expect(mockWalletService.credit).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        credited: false,
        message: expect.stringContaining('not found'),
      }),
    );
  });

  it('should not credit for rejected or pending statuses', async () => {
    const { req, res } = createMockReqRes(true);
    const query = {
      uid: 'user-123',
      conversion_no: 'tx-rejected',
      status: 'rejected',
    };

    await controller.handleGetPostback('mooffers', query, '', '', '', '', '', req, res);

    expect(mockWalletService.credit).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        credited: false,
        message: expect.stringContaining('rejected'),
      }),
    );
  });

  it('should handle concurrent P2002 duplicate constraint error gracefully', async () => {
    const { req, res } = createMockReqRes(true);
    const p2002Error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '5.19.1',
    });
    mockPrisma.offerCompletion.create.mockRejectedValueOnce(p2002Error);

    const query = {
      uid: 'user-123',
      conversion_no: 'tx-race',
      payout: '0.10',
    };

    await controller.handleGetPostback('mooffers', query, '', '', '', '', '', req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        credited: false,
        message: 'Already processed',
      }),
    );
  });

  it('should return a structured error response with status 400 for unknown provider', async () => {
    const { req, res } = createMockReqRes(true);
    mockPrisma.offerProvider.findFirst.mockResolvedValueOnce(null);

    await controller.handleGetPostback('unknown-network', {}, '', '', '', '', '', req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: HttpStatus.BAD_REQUEST,
        message: expect.stringContaining('Unknown or inactive provider'),
      }),
    );
  });
});
