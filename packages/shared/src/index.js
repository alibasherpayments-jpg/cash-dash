"use strict";
// ============================================================
// CashDash Shared Types & Enums
// Used across both apps/web and apps/api
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.POINTS_PER_DOLLAR = exports.AuditAction = exports.LeaderboardMetric = exports.WithdrawalFieldType = exports.RiskStatus = exports.RiskLevel = exports.TicketCategory = exports.TicketStatus = exports.NotificationType = exports.WithdrawalStatus = exports.TransactionStatus = exports.TransactionDirection = exports.TransactionType = exports.OfferCompletionStatus = exports.OfferStatus = exports.OfferDifficulty = exports.OfferCategory = exports.UserStatus = exports.UserRole = void 0;
exports.pointsToCash = pointsToCash;
exports.cashToPoints = cashToPoints;
exports.formatPoints = formatPoints;
exports.formatCash = formatCash;
// ---- Enums ----
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPPORT"] = "SUPPORT";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
    UserStatus["BANNED"] = "BANNED";
    UserStatus["PENDING_VERIFICATION"] = "PENDING_VERIFICATION";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var OfferCategory;
(function (OfferCategory) {
    OfferCategory["GAMES"] = "GAMES";
    OfferCategory["APPS"] = "APPS";
    OfferCategory["SURVEYS"] = "SURVEYS";
    OfferCategory["SHOPPING"] = "SHOPPING";
    OfferCategory["FINANCE"] = "FINANCE";
    OfferCategory["SIGN_UP"] = "SIGN_UP";
    OfferCategory["TRIALS"] = "TRIALS";
    OfferCategory["OTHER"] = "OTHER";
})(OfferCategory || (exports.OfferCategory = OfferCategory = {}));
var OfferDifficulty;
(function (OfferDifficulty) {
    OfferDifficulty["EASY"] = "EASY";
    OfferDifficulty["MEDIUM"] = "MEDIUM";
    OfferDifficulty["HARD"] = "HARD";
})(OfferDifficulty || (exports.OfferDifficulty = OfferDifficulty = {}));
var OfferStatus;
(function (OfferStatus) {
    OfferStatus["ACTIVE"] = "ACTIVE";
    OfferStatus["INACTIVE"] = "INACTIVE";
    OfferStatus["EXPIRED"] = "EXPIRED";
    OfferStatus["FEATURED"] = "FEATURED";
})(OfferStatus || (exports.OfferStatus = OfferStatus = {}));
var OfferCompletionStatus;
(function (OfferCompletionStatus) {
    OfferCompletionStatus["CLICKED"] = "CLICKED";
    OfferCompletionStatus["STARTED"] = "STARTED";
    OfferCompletionStatus["PENDING"] = "PENDING";
    OfferCompletionStatus["COMPLETED"] = "COMPLETED";
    OfferCompletionStatus["REJECTED"] = "REJECTED";
    OfferCompletionStatus["REVERSED"] = "REVERSED";
    OfferCompletionStatus["EXPIRED"] = "EXPIRED";
    OfferCompletionStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
})(OfferCompletionStatus || (exports.OfferCompletionStatus = OfferCompletionStatus = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["OFFER_REWARD"] = "OFFER_REWARD";
    TransactionType["SURVEY_REWARD"] = "SURVEY_REWARD";
    TransactionType["REFERRAL_REWARD"] = "REFERRAL_REWARD";
    TransactionType["DAILY_BONUS"] = "DAILY_BONUS";
    TransactionType["PROMOTIONAL_BONUS"] = "PROMOTIONAL_BONUS";
    TransactionType["WITHDRAWAL"] = "WITHDRAWAL";
    TransactionType["WITHDRAWAL_REVERSAL"] = "WITHDRAWAL_REVERSAL";
    TransactionType["ADMIN_ADJUSTMENT"] = "ADMIN_ADJUSTMENT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionDirection;
(function (TransactionDirection) {
    TransactionDirection["CREDIT"] = "CREDIT";
    TransactionDirection["DEBIT"] = "DEBIT";
})(TransactionDirection || (exports.TransactionDirection = TransactionDirection = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["REVERSED"] = "REVERSED";
    TransactionStatus["FAILED"] = "FAILED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var WithdrawalStatus;
(function (WithdrawalStatus) {
    WithdrawalStatus["PENDING"] = "PENDING";
    WithdrawalStatus["PROCESSING"] = "PROCESSING";
    WithdrawalStatus["PAID"] = "PAID";
    WithdrawalStatus["COMPLETED"] = "COMPLETED";
    WithdrawalStatus["REJECTED"] = "REJECTED";
    WithdrawalStatus["CANCELLED"] = "CANCELLED";
    WithdrawalStatus["FAILED"] = "FAILED";
    WithdrawalStatus["REFUNDED"] = "REFUNDED";
    WithdrawalStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
})(WithdrawalStatus || (exports.WithdrawalStatus = WithdrawalStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["REWARD_ADDED"] = "REWARD_ADDED";
    NotificationType["REWARD_PENDING"] = "REWARD_PENDING";
    NotificationType["REWARD_REVERSED"] = "REWARD_REVERSED";
    NotificationType["WITHDRAWAL_REQUESTED"] = "WITHDRAWAL_REQUESTED";
    NotificationType["WITHDRAWAL_PROCESSING"] = "WITHDRAWAL_PROCESSING";
    NotificationType["WITHDRAWAL_COMPLETED"] = "WITHDRAWAL_COMPLETED";
    NotificationType["WITHDRAWAL_REJECTED"] = "WITHDRAWAL_REJECTED";
    NotificationType["REFERRAL_REWARD"] = "REFERRAL_REWARD";
    NotificationType["PROMOTIONAL"] = "PROMOTIONAL";
    NotificationType["SYSTEM_ANNOUNCEMENT"] = "SYSTEM_ANNOUNCEMENT";
    NotificationType["ACHIEVEMENT_UNLOCKED"] = "ACHIEVEMENT_UNLOCKED";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["OPEN"] = "OPEN";
    TicketStatus["WAITING_FOR_USER"] = "WAITING_FOR_USER";
    TicketStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TicketStatus["RESOLVED"] = "RESOLVED";
    TicketStatus["CLOSED"] = "CLOSED";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
var TicketCategory;
(function (TicketCategory) {
    TicketCategory["OFFER_ISSUE"] = "OFFER_ISSUE";
    TicketCategory["WITHDRAWAL_ISSUE"] = "WITHDRAWAL_ISSUE";
    TicketCategory["ACCOUNT_ISSUE"] = "ACCOUNT_ISSUE";
    TicketCategory["PAYMENT_ISSUE"] = "PAYMENT_ISSUE";
    TicketCategory["TECHNICAL_ISSUE"] = "TECHNICAL_ISSUE";
    TicketCategory["OTHER"] = "OTHER";
})(TicketCategory || (exports.TicketCategory = TicketCategory = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "LOW";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["HIGH"] = "HIGH";
    RiskLevel["CRITICAL"] = "CRITICAL";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var RiskStatus;
(function (RiskStatus) {
    RiskStatus["CLEAR"] = "CLEAR";
    RiskStatus["MONITORING"] = "MONITORING";
    RiskStatus["REVIEW_REQUIRED"] = "REVIEW_REQUIRED";
    RiskStatus["RESTRICTED"] = "RESTRICTED";
})(RiskStatus || (exports.RiskStatus = RiskStatus = {}));
var WithdrawalFieldType;
(function (WithdrawalFieldType) {
    WithdrawalFieldType["TEXT"] = "TEXT";
    WithdrawalFieldType["EMAIL"] = "EMAIL";
    WithdrawalFieldType["NUMBER"] = "NUMBER";
    WithdrawalFieldType["SELECT"] = "SELECT";
    WithdrawalFieldType["TEXTAREA"] = "TEXTAREA";
})(WithdrawalFieldType || (exports.WithdrawalFieldType = WithdrawalFieldType = {}));
var LeaderboardMetric;
(function (LeaderboardMetric) {
    LeaderboardMetric["TOTAL_WITHDRAWN"] = "TOTAL_WITHDRAWN";
    LeaderboardMetric["TOTAL_EARNED"] = "TOTAL_EARNED";
    LeaderboardMetric["TOTAL_REFERRALS"] = "TOTAL_REFERRALS";
})(LeaderboardMetric || (exports.LeaderboardMetric = LeaderboardMetric = {}));
var AuditAction;
(function (AuditAction) {
    AuditAction["USER_SUSPENDED"] = "USER_SUSPENDED";
    AuditAction["USER_UNSUSPENDED"] = "USER_UNSUSPENDED";
    AuditAction["USER_VERIFIED"] = "USER_VERIFIED";
    AuditAction["BALANCE_ADJUSTED"] = "BALANCE_ADJUSTED";
    AuditAction["WITHDRAWAL_APPROVED"] = "WITHDRAWAL_APPROVED";
    AuditAction["WITHDRAWAL_REJECTED"] = "WITHDRAWAL_REJECTED";
    AuditAction["WITHDRAWAL_PAID"] = "WITHDRAWAL_PAID";
    AuditAction["WITHDRAWAL_METHOD_CREATED"] = "WITHDRAWAL_METHOD_CREATED";
    AuditAction["WITHDRAWAL_METHOD_UPDATED"] = "WITHDRAWAL_METHOD_UPDATED";
    AuditAction["WITHDRAWAL_METHOD_DELETED"] = "WITHDRAWAL_METHOD_DELETED";
    AuditAction["OFFER_CREATED"] = "OFFER_CREATED";
    AuditAction["OFFER_UPDATED"] = "OFFER_UPDATED";
    AuditAction["OFFER_DELETED"] = "OFFER_DELETED";
    AuditAction["SETTINGS_UPDATED"] = "SETTINGS_UPDATED";
    AuditAction["PROVIDER_UPDATED"] = "PROVIDER_UPDATED";
    AuditAction["NOTIFICATION_SENT"] = "NOTIFICATION_SENT";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
// ---- Points Formatting Helper Constants ----
exports.POINTS_PER_DOLLAR = 10000; // 10,000 points = $1.00
function pointsToCash(points, conversionRate = exports.POINTS_PER_DOLLAR) {
    return points / conversionRate;
}
function cashToPoints(cash, conversionRate = exports.POINTS_PER_DOLLAR) {
    return Math.floor(cash * conversionRate);
}
function formatPoints(points) {
    return new Intl.NumberFormat('en-US').format(points);
}
function formatCash(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
//# sourceMappingURL=index.js.map