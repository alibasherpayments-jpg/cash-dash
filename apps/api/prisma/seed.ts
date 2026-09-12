import {
  PrismaClient,
  UserRole,
  UserStatus,
  OfferCategory,
  OfferDifficulty,
  OfferStatus,
  WithdrawalFieldType,
  AuditAction,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Cash Dash database...');

  // Clean existing data
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "OfferProvider" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "WithdrawalMethod" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Achievement" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "SystemSetting" CASCADE;`);

  const passwordHashAdmin = await bcrypt.hash('Admin@CashDash2024!', 10);

  // ----------------------------------------------------
  // 1. System Settings (1,000 Points = $1.00 USD)
  // ----------------------------------------------------
  console.log('Creating system settings...');
  const settings = [
    { key: 'site_name', value: 'Cash Dash', type: 'string', category: 'general', label: 'Platform Name' },
    { key: 'support_email', value: 'support@cashdash.io', type: 'string', category: 'general', label: 'Support Email' },
    { key: 'currency_code', value: 'USD', type: 'string', category: 'general', label: 'Default Currency' },
    { key: 'points_conversion_rate', value: '1000', type: 'number', category: 'earning', label: 'Points per $1.00 USD' },
    { key: 'min_withdrawal_points', value: '100', type: 'number', category: 'earning', label: 'Minimum Withdrawal Points (100 pts = $0.10)' },
    { key: 'referral_percentage', value: '10', type: 'number', category: 'earning', label: 'Referral Commission %' },
    { key: 'daily_goal_default_points', value: '500', type: 'number', category: 'earning', label: 'Daily Goal Points' },
    { key: 'leaderboard_enabled', value: 'true', type: 'boolean', category: 'leaderboard', label: 'Leaderboard Public' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'security', label: 'Maintenance Mode' },
    { key: 'email_verification_required', value: 'false', type: 'boolean', category: 'security', label: 'Require Email Verification' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.create({ data: s });
  }

  // ----------------------------------------------------
  // 2. Achievements
  // ----------------------------------------------------
  console.log('Creating achievements...');
  const achievements = [
    { slug: 'first-reward', name: 'First Reward', description: 'Complete your first offer and earn points', badgeColor: '#6366F1', xpReward: 50, requirement: { offersCount: 1 } },
    { slug: 'offer-master-10', name: 'Offer Master I', description: 'Complete 10 eligible offers or surveys', badgeColor: '#8B5CF6', xpReward: 150, requirement: { offersCount: 10 } },
    { slug: 'offer-master-50', name: 'Offer Master II', description: 'Complete 50 eligible offers or surveys', badgeColor: '#EC4899', xpReward: 500, requirement: { offersCount: 50 } },
    { slug: 'offer-master-100', name: 'Offer Legend', description: 'Complete 100 offers on Cash Dash', badgeColor: '#F59E0B', xpReward: 1000, requirement: { offersCount: 100 } },
    { slug: 'first-withdrawal', name: 'First Cashout', description: 'Request your first reward payout', badgeColor: '#10B981', xpReward: 100, requirement: { withdrawalsCount: 1 } },
    { slug: 'cashout-100', name: 'Century Club', description: 'Withdraw over $100 equivalent in rewards', badgeColor: '#06B6D4', xpReward: 500, requirement: { totalWithdrawnPoints: 100000 } },
    { slug: 'referral-starter', name: 'Social Butterfly', description: 'Invite your first friend who earns points', badgeColor: '#F97316', xpReward: 100, requirement: { referralsCount: 1 } },
    { slug: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day active earning streak', badgeColor: '#EF4444', xpReward: 200, requirement: { streakDays: 7 } },
  ];

  for (const ach of achievements) {
    await prisma.achievement.create({ data: ach });
  }

  // ----------------------------------------------------
  // 3. Top Offerwall Providers
  // ----------------------------------------------------
  console.log('Creating offerwall providers (Taskwall.io, CPALead, ClickWall.io)...');
  const taskwall = await prisma.offerProvider.create({
    data: {
      name: 'Taskwall.io',
      type: 'tasks',
      slug: 'taskwall',
      logoUrl: '/images/offerwalls/taskwall.png',
      apiKeyMasked: 'taskwall_live_••••••••••••88a1',
      webhookSecret: 'taskwall-secret-cashdash',
      postbackUrl: 'http://localhost:3001/api/v1/webhooks/providers/taskwall',
      isActive: true,
      offersCount: 35,
    },
  });

  const cpalead = await prisma.offerProvider.create({
    data: {
      name: 'CPALead',
      type: 'cpi_offers',
      slug: 'cpalead',
      logoUrl: '/images/offerwalls/cpalead.png',
      apiKeyMasked: 'cpalead_••••••••••••99c3',
      webhookSecret: 'cpalead-secret-cashdash',
      postbackUrl: 'http://localhost:3001/api/v1/webhooks/providers/cpalead',
      isActive: true,
      offersCount: 20,
    },
  });

  const clickwall = await prisma.offerProvider.create({
    data: {
      name: 'ClickWall.io',
      type: 'ptc_clicks',
      slug: 'clickwall',
      logoUrl: '/images/offerwalls/clickwall.png',
      apiKeyMasked: 'clickwall_••••••••••••33f7',
      webhookSecret: 'clickwall-secret-cashdash',
      postbackUrl: 'http://localhost:3001/api/v1/webhooks/providers/clickwall',
      isActive: true,
      offersCount: 40,
    },
  });

  // ----------------------------------------------------
  // 4. Withdrawal Methods: Vodafone Cash & Binance ONLY
  // Min: $0.10 (100 points at 1,000 pts = $1.00 USD)
  // ----------------------------------------------------
  console.log('Creating Vodafone Cash and Binance withdrawal methods (Min 100 pts / $0.10)...');

  await prisma.withdrawalMethod.create({
    data: {
      name: 'Vodafone Cash (فودافون كاش)',
      slug: 'vodafone-cash',
      logoUrl: '/images/methods/vodafone-cash.png',
      description: 'سحب فوري إلى محفظة فودافون كاش في مصر بالجنيه المصري (EGP). الحد الأدنى 10 سنت (100 نقطة).',
      minimumPoints: 100, // $0.10 USD
      maximumPoints: 500000, // $500.00 USD
      feePercent: 0,
      processingTime: 'Instant to 30 mins',
      isActive: true,
      displayOrder: 1,
      requirements: {
        create: [
          {
            fieldName: 'walletNumber',
            label: 'Vodafone Cash Mobile Number (رقم محفظة فودافون كاش)',
            type: WithdrawalFieldType.TEXT,
            placeholder: '010xxxxxxxx',
            helpText: 'تأكد من أن الرقم مسجل به محفظة فودافون كاش مفعلة',
            isRequired: true,
            displayOrder: 1,
          },
          {
            fieldName: 'accountHolderName',
            label: 'Account Holder Full Name (اسم صاحب المحفظة)',
            type: WithdrawalFieldType.TEXT,
            placeholder: 'Full name as registered on Vodafone Cash',
            isRequired: true,
            displayOrder: 2,
          },
        ],
      },
    },
  });

  await prisma.withdrawalMethod.create({
    data: {
      name: 'Binance (USDT / Pay / UID)',
      slug: 'binance',
      logoUrl: '/images/methods/binance.png',
      description: 'سحب فوري مباشر عبر منصة بينانس عبر Binance Pay ID أو UID أو شبكات USDT (BEP20 / TRC20). الحد الأدنى 10 سنت (100 نقطة).',
      minimumPoints: 100, // $0.10 USD
      maximumPoints: 1000000, // $1,000.00 USD
      feePercent: 0,
      processingTime: 'Instant to 2 hours',
      isActive: true,
      displayOrder: 2,
      requirements: {
        create: [
          {
            fieldName: 'transferMethod',
            label: 'Transfer Method (طريقة التحويل)',
            type: WithdrawalFieldType.SELECT,
            placeholder: 'Select transfer method',
            options: ['Binance Pay ID', 'Binance UID', 'USDT Address (BEP20)', 'USDT Address (TRC20)'],
            isRequired: true,
            displayOrder: 1,
          },
          {
            fieldName: 'recipientIdentifier',
            label: 'Binance Pay ID / UID or USDT Address (معرف الحساب أو العنوان)',
            type: WithdrawalFieldType.TEXT,
            placeholder: 'Enter your Binance Pay ID, User ID, or USDT deposit address',
            helpText: 'تأكد من صحة العنوان أو المعرف، المعاملات المشفرة لا يمكن استرجاعها',
            isRequired: true,
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // ----------------------------------------------------
  // 5. Clean Admin User ONLY (Zero fake users!)
  // ----------------------------------------------------
  console.log('Creating master admin account (No fake users)...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@cashdash.io',
      username: 'admin',
      passwordHash: passwordHashAdmin,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      referralCode: 'ADMIN-MASTER',
      profile: {
        create: {
          avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin_master',
          country: 'EG',
          bio: 'Cash Dash Platform Administrator',
          isLeaderboardVisible: false,
        },
      },
      wallet: {
        create: {
          availablePoints: 25000,
          pendingPoints: 0,
          totalEarned: 50000,
          totalWithdrawn: 25000,
        },
      },
      userStreak: {
        create: { currentStreak: 5, longestStreak: 10 },
      },
      notificationPref: { create: {} },
    },
  });

  // ----------------------------------------------------
  // 6. Clean Offers Table (Zero placeholder offers! All real offers from Offerwalls or Admin)
  // ----------------------------------------------------
  console.log('Offers directory is clean and empty (no placeholder offers).');


  // ----------------------------------------------------
  // 7. Initial Admin Audit Log
  // ----------------------------------------------------
  await prisma.auditLog.create({
    data: {
      adminId: adminUser.id,
      action: AuditAction.SETTINGS_UPDATED,
      entityType: 'System',
      entityId: 'SYSTEM-INIT',
      newValue: {
        details: 'Initialized Cash Dash production settings: Vodafone Cash & Binance only, 1,000 pts = $1.00 USD, zero fake users.',
      },
    },
  });

  console.log('✅ Cash Dash database seeded cleanly and successfully!');
  console.log('----------------------------------------------------');
  console.log('🔑 Admin Account: admin@cashdash.io / Admin@CashDash2024!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
