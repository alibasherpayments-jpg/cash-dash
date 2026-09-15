import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface RewardAlertPayload {
  provider: string;
  offerTitle: string;
  rewardPoints: number;
  payoutUsd: number;
  username: string;
  userId: string;
  txId?: string;
  date?: Date;
  imageUrl?: string;
  offerId?: string;
}

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly adminChatId: string;
  private readonly stateFilePath: string;

  private isPaused: boolean = false;
  private isPolling: boolean = false;
  private lastUpdateId: number = 0;
  private pollAbortController: AbortController | null = null;
  private offerIconsCache: Map<string, string> = new Map();
  private lastCacheFetchTime: number = 0;


  constructor(private configService: ConfigService) {
    this.botToken =
      this.configService.get<string>('TELEGRAM_BOT_TOKEN') ||
      process.env.TELEGRAM_BOT_TOKEN ||
      '8636306781:AAFm7NwgwqJPvNUxKhP_tdCbiAL28nbaPUM';
    this.adminChatId = String(
      this.configService.get<string>('TELEGRAM_ADMIN_CHAT_ID') ||
        process.env.TELEGRAM_ADMIN_CHAT_ID ||
        '7244039908',
    ).trim();
    this.stateFilePath = path.join(process.cwd(), 'telegram-bot-state.json');

    this.loadState();
  }

  onModuleInit() {
    if (this.botToken && this.adminChatId) {
      this.startPolling();
    } else {
      this.logger.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID not configured; polling disabled.');
    }
  }

  onModuleDestroy() {
    this.stopPolling();
  }

  /**
   * Load paused state from disk so settings persist across server restarts.
   */
  private loadState() {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (typeof parsed.isPaused === 'boolean') {
          this.isPaused = parsed.isPaused;
        }
        if (typeof parsed.lastUpdateId === 'number') {
          this.lastUpdateId = parsed.lastUpdateId;
        }
        this.logger.log(`Loaded Telegram Bot state: isPaused=${this.isPaused}`);
      }
    } catch (err) {
      this.logger.warn(`Could not load Telegram state file: ${(err as Error).message}`);
    }
  }

  /**
   * Persist current paused state to disk.
   */
  private saveState() {
    try {
      const data = {
        isPaused: this.isPaused,
        lastUpdateId: this.lastUpdateId,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(this.stateFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      this.logger.warn(`Could not save Telegram state file: ${(err as Error).message}`);
    }
  }

  /**
   * Start background long-polling for user commands (/start, /pause, /status).
   */
  private async startPolling() {
    this.isPolling = true;
    this.logger.log('Starting Telegram Bot long-polling for /start and /pause commands...');

    // Run in background without blocking NestJS bootstrap
    (async () => {
      while (this.isPolling) {
        try {
          this.pollAbortController = new AbortController();
          const timeoutSignal = this.pollAbortController.signal;

          const url = `https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=20`;
          const res = await fetch(url, { signal: timeoutSignal });

          if (!res.ok) {
            this.logger.warn(`getUpdates failed with status ${res.status}`);
            await this.sleep(3000);
            continue;
          }

          const data = (await res.json()) as any;
          if (data && data.ok && Array.isArray(data.result)) {
            for (const update of data.result) {
              if (update.update_id > this.lastUpdateId) {
                this.lastUpdateId = update.update_id;
              }
              await this.handleUpdate(update);
            }
            if (data.result.length > 0) {
              this.saveState();
            }
          }
        } catch (err) {
          if (!this.isPolling) break;
          // Ignore abort errors during shutdown
          if ((err as Error).name !== 'AbortError') {
            this.logger.debug(`Polling loop error: ${(err as Error).message}`);
          }
          await this.sleep(3000);
        }
      }
    })();
  }

  private stopPolling() {
    this.isPolling = false;
    if (this.pollAbortController) {
      this.pollAbortController.abort();
      this.pollAbortController = null;
    }
  }

  /**
   * Process incoming Telegram updates and execute commands.
   */
  private async handleUpdate(update: any) {
    const msg = update.message;
    if (!msg || !msg.text) return;

    const chatId = String(msg.chat.id);
    const text = msg.text.trim().toLowerCase();

    // Verify sender is the authorized admin
    if (chatId !== this.adminChatId) {
      this.logger.warn(`Unauthorized command from chat ID ${chatId}: ${text}`);
      return;
    }

    if (text === '/start' || text.startsWith('/start') || text === '/resume') {
      this.isPaused = false;
      this.saveState();

      const reply = [
        '🟢 <b>Notifications Activated!</b>',
        '━━━━━━━━━━━━━━━━━━━━',
        'Bot is now <b>ACTIVE</b> and sending notifications.',
        'You will receive instant alerts whenever any task/offer is credited on Cash Dash!',
        '',
        '<b>Available Commands:</b>',
        '• /pause - Temporarily stop receiving notifications',
        '• /status - Check if notifications are active or paused',
        '• /test - Send a test alert',
        '━━━━━━━━━━━━━━━━━━━━',
        '✅ <i>Ready to receive task alerts!</i>',
      ].join('\n');

      await this.sendMessage(chatId, reply);
      this.logger.log('Telegram notifications RESUMED via /start command.');
    } else if (text === '/pause' || text === '/stop') {
      this.isPaused = true;
      this.saveState();

      const reply = [
        '⏸️ <b>Notifications Paused!</b>',
        '━━━━━━━━━━━━━━━━━━━━',
        'Taskwall and offerwall notifications are now <b>PAUSED</b>.',
        'You will <b>NOT</b> receive alerts until you resume.',
        '',
        '👉 <i>Send <code>/start</code> anytime to resume notifications!</i>',
        '━━━━━━━━━━━━━━━━━━━━',
      ].join('\n');

      await this.sendMessage(chatId, reply);
      this.logger.log('Telegram notifications PAUSED via /pause command.');
    } else if (text === '/status') {
      const statusText = this.isPaused
        ? '⏸️ <b>PAUSED</b> (Notifications are currently silenced)'
        : '🟢 <b>ACTIVE</b> (Notifications are actively running)';

      const reply = [
        '📊 <b>Bot Status Overview:</b>',
        '━━━━━━━━━━━━━━━━━━━━',
        `Current Status: ${statusText}`,
        `Admin Chat ID: <code>${this.adminChatId}</code>`,
        '━━━━━━━━━━━━━━━━━━━━',
        'Use /start to activate or /pause to pause.',
      ].join('\n');

      await this.sendMessage(chatId, reply);
    } else if (text === '/test') {
      if (this.isPaused) {
        await this.sendMessage(
          chatId,
          '⚠️ <b>Notifications are currently PAUSED.</b>\nSend <code>/start</code> first to enable notifications!',
        );
      } else {
        await this.sendRewardAlert({
          provider: 'Taskwall.io',
          offerTitle: 'Sample Game Offer - Level 10 (Test)',
          rewardPoints: 2400,
          payoutUsd: 2.4,
          username: 'Arsen',
          userId: 'test_user_id',
          txId: `test-${Date.now()}`,
          date: new Date(),
        });
      }
    }
  }

  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * Send a formatted task completion alert to Telegram.
   * Returns false if notifications are paused or if an error occurs.
   */
  async sendRewardAlert(payload: RewardAlertPayload): Promise<boolean> {
    this.logger.log(
      `sendRewardAlert triggered: offer="${payload.offerTitle}", payout=$${payload.payoutUsd}, isPaused=${this.isPaused}, adminChatId=${this.adminChatId}`,
    );

    if (!this.botToken || !this.adminChatId) {
      this.logger.warn('Telegram bot token or admin chat ID not configured. Skipping alert.');
      return false;
    }

    // CHECK PAUSE STATUS
    if (this.isPaused) {
      this.logger.log(`Telegram notifications are PAUSED (/pause). Skipping alert for: "${payload.offerTitle}"`);
      return false;
    }


    const dateStr =
      (payload.date || new Date()).toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }) + ' UTC';

    const message = [
      '🎉 <b>New Task Completed on Cash Dash!</b>',
      '━━━━━━━━━━━━━━━━━━━━',
      `🏷️ <b>Offer:</b> ${this.escapeHtml(payload.offerTitle)}`,
      `🏢 <b>Provider:</b> <b>${this.escapeHtml(payload.provider)}</b>`,
      `💵 <b>Payout:</b> <b>$${payload.payoutUsd.toFixed(2)} USD</b>`,
      `🪙 <b>Points:</b> +${payload.rewardPoints.toLocaleString()} Points`,
      `👤 <b>User:</b> ${this.escapeHtml(payload.username)} (<code>${this.escapeHtml(payload.userId)}</code>)`,
      payload.txId ? `🆔 <b>Tx ID:</b> <code>${this.escapeHtml(payload.txId)}</code>` : '',
      `🕒 <b>Date:</b> ${dateStr}`,
      '━━━━━━━━━━━━━━━━━━━━',
      '✅ <i>Credited successfully to user wallet!</i>',
    ]
      .filter(Boolean)
      .join('\n');

    // Attempt to resolve offer image if not passed directly
    let imageUrl = payload.imageUrl;
    if (!imageUrl && payload.offerId) {
      imageUrl = await this.getTaskwallOfferIcon(payload.offerId);
    }

    // Try sending as Photo with caption first
    if (imageUrl) {
      const photoSent = await this.sendPhoto(this.adminChatId, imageUrl, message);
      if (photoSent) return true;
    }

    // Fallback to text message
    return this.sendMessage(this.adminChatId, message);
  }

  /**
   * Fetch and cache offer icon from Taskwall API.
   */
  async getTaskwallOfferIcon(offerId: string): Promise<string | undefined> {
    if (!offerId || offerId === 'N/A') return undefined;

    if (this.offerIconsCache.has(offerId)) {
      return this.offerIconsCache.get(offerId);
    }

    const now = Date.now();
    if (now - this.lastCacheFetchTime > 10 * 60 * 1000 || this.offerIconsCache.size === 0) {
      try {
        const res = await fetch('https://wall.taskwall.io/api/?app_id=6404e8a2318aa5f42725dd3c2cbc8d46&userid=admin');
        if (res.ok) {
          const data = (await res.json()) as any;
          const offers = Array.isArray(data) ? data : (data.offers || []);
          for (const off of offers) {
            if (off && off.offer_id && off.icon) {
              this.offerIconsCache.set(String(off.offer_id), String(off.icon));
            }
          }
          this.lastCacheFetchTime = now;
        }
      } catch (err) {
        this.logger.debug(`Could not cache Taskwall icons: ${(err as Error).message}`);
      }
    }

    return this.offerIconsCache.get(offerId);
  }

  /**
   * Send a photo with formatted HTML caption to Telegram.
   */
  async sendPhoto(chatId: string, photoUrl: string, caption: string): Promise<boolean> {
    if (!this.botToken) return false;

    const url = `https://api.telegram.org/bot${this.botToken}/sendPhoto`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
          caption,
          parse_mode: 'HTML',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errorText = await res.text();
        this.logger.warn(`Telegram sendPhoto failed (${res.status}): ${errorText}. Falling back to text.`);
        return false;
      }

      this.logger.log(`Telegram photo alert delivered successfully to chat ${chatId}`);
      return true;
    } catch (err) {
      clearTimeout(timeout);
      this.logger.warn(`Failed to send Telegram photo: ${(err as Error).message}`);
      return false;
    }
  }

  /**
   * Send a raw HTML text message to any chat ID.
   */
  async sendMessage(chatId: string, text: string): Promise<boolean> {
    if (!this.botToken) return false;

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errorText = await res.text();
        this.logger.warn(`Telegram API error (${res.status}): ${errorText}`);
        return false;
      }

      this.logger.log(`Telegram notification delivered successfully to chat ${chatId}`);
      return true;
    } catch (err) {
      clearTimeout(timeout);
      this.logger.warn(`Failed to send Telegram notification: ${(err as Error).message}`);
      return false;
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
