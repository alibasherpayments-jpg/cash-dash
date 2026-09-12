// ============================================================
// CashDash Shared Types & Enums
// Used across both apps/web and apps/api
// ============================================================

// ---- Enums ----

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum OfferCategory {
  GAMES = 'GAMES',
  APPS = 'APPS',
  SURVEYS = 'SURVEYS',
  SHOPPING = 'SHOPPING',
  FINANCE = 'FINANCE',
  SIGN_UP = 'SIGN_UP',
  TRIALS = 'TRIALS',
  OTHER = 'OTHER',
}

export enum OfferDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum OfferStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  FEATURED = 'FEATURED',
}

export enum OfferCompletionStatus {
  CLICKED = 'CLICKED',
  STARTED = 'STARTED',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  REVERSED = 'REVERSED',
  EXPIRED = 'EXPIRED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export enum TransactionType {
  OFFER_REWARD = 'OFFER_REWARD',
  SURVEY_REWARD = 'SURVEY_REWARD',
  REFERRAL_REWARD = 'REFERRAL_REWARD',
  DAILY_BONUS = 'DAILY_BONUS',
  PROMOTIONAL_BONUS = 'PROMOTIONAL_BONUS',
  WITHDRAWAL = 'WITHDRAWAL',
  WITHDRAWAL_REVERSAL = 'WITHDRAWAL_REVERSAL',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
}

export enum TransactionDirection {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REVERSED = 'REVERSED',
  FAILED = 'FAILED',
}

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export enum NotificationType {
  REWARD_ADDED = 'REWARD_ADDED',
  REWARD_PENDING = 'REWARD_PENDING',
  REWARD_REVERSED = 'REWARD_REVERSED',
  WITHDRAWAL_REQUESTED = 'WITHDRAWAL_REQUESTED',
  WITHDRAWAL_PROCESSING = 'WITHDRAWAL_PROCESSING',
  WITHDRAWAL_COMPLETED = 'WITHDRAWAL_COMPLETED',
  WITHDRAWAL_REJECTED = 'WITHDRAWAL_REJECTED',
  REFERRAL_REWARD = 'REFERRAL_REWARD',
  PROMOTIONAL = 'PROMOTIONAL',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  WAITING_FOR_USER = 'WAITING_FOR_USER',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketCategory {
  OFFER_ISSUE = 'OFFER_ISSUE',
  WITHDRAWAL_ISSUE = 'WITHDRAWAL_ISSUE',
  ACCOUNT_ISSUE = 'ACCOUNT_ISSUE',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
  OTHER = 'OTHER',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RiskStatus {
  CLEAR = 'CLEAR',
  MONITORING = 'MONITORING',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  RESTRICTED = 'RESTRICTED',
}

export enum WithdrawalFieldType {
  TEXT = 'TEXT',
  EMAIL = 'EMAIL',
  NUMBER = 'NUMBER',
  SELECT = 'SELECT',
  TEXTAREA = 'TEXTAREA',
}

export enum LeaderboardMetric {
  TOTAL_WITHDRAWN = 'TOTAL_WITHDRAWN',
  TOTAL_EARNED = 'TOTAL_EARNED',
  TOTAL_REFERRALS = 'TOTAL_REFERRALS',
}

export enum AuditAction {
  USER_SUSPENDED = 'USER_SUSPENDED',
  USER_UNSUSPENDED = 'USER_UNSUSPENDED',
  USER_VERIFIED = 'USER_VERIFIED',
  BALANCE_ADJUSTED = 'BALANCE_ADJUSTED',
  WITHDRAWAL_APPROVED = 'WITHDRAWAL_APPROVED',
  WITHDRAWAL_REJECTED = 'WITHDRAWAL_REJECTED',
  WITHDRAWAL_PAID = 'WITHDRAWAL_PAID',
  WITHDRAWAL_METHOD_CREATED = 'WITHDRAWAL_METHOD_CREATED',
  WITHDRAWAL_METHOD_UPDATED = 'WITHDRAWAL_METHOD_UPDATED',
  WITHDRAWAL_METHOD_DELETED = 'WITHDRAWAL_METHOD_DELETED',
  OFFER_CREATED = 'OFFER_CREATED',
  OFFER_UPDATED = 'OFFER_UPDATED',
  OFFER_DELETED = 'OFFER_DELETED',
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  PROVIDER_UPDATED = 'PROVIDER_UPDATED',
  NOTIFICATION_SENT = 'NOTIFICATION_SENT',
}

// ---- Core Shared Types ----

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  referralCode?: string;
  createdAt: string;
  profile?: {
    avatarUrl?: string | null;
    country?: string;
    bio?: string;
    isLeaderboardVisible: boolean;
  };
}

export interface WalletSummary {
  availablePoints: number;
  pendingPoints: number;
  totalEarned: number;
  totalWithdrawn: number;
  cashValue: number; // USD equivalent
}

export interface OfferPublic {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  description: string;
  category: OfferCategory;
  rewardPoints: number;
  cashValue: number;
  iconUrl?: string;
  imageUrl?: string;
  estimatedMinutes: number;
  difficulty: OfferDifficulty;
  countries: string[];
  requirements: string[];
  status: OfferStatus;
  isFeatured: boolean;
  isRecommended: boolean;
  expiresAt?: string;
  startDate: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  value: number; // points or USD depending on metric
  metric: LeaderboardMetric;
}

export interface NotificationPublic {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
  link?: string;
  createdAt: string;
}

// ---- Points Formatting Helper Constants ----
export const POINTS_PER_DOLLAR = 1000; // 1,000 points = $1.00

export function pointsToCash(points: number, conversionRate = POINTS_PER_DOLLAR): number {
  return points / conversionRate;
}

export function cashToPoints(cash: number, conversionRate = POINTS_PER_DOLLAR): number {
  return Math.floor(cash * conversionRate);
}

export function formatPoints(points: number): string {
  return new Intl.NumberFormat('en-US').format(points);
}

export function formatCash(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
