import { PrismaClient, UserRole, UserStatus, OfferCategory, OfferDifficulty, OfferStatus, OfferCompletionStatus, TransactionType, TransactionDirection, TransactionStatus, WithdrawalStatus, WithdrawalFieldType, NotificationType, TicketStatus, TicketCategory, RiskLevel, RiskStatus, LeaderboardMetric, AuditAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CashDash database with realistic demo data...');

  // Clean existing data
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "OfferProvider" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "WithdrawalMethod" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Achievement" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "SystemSetting" CASCADE;`);

  const passwordHashAdmin = await bcrypt.hash('Admin@CashDash2024!', 10);
  const passwordHashUser = await bcrypt.hash('Password123!', 10);

  // ----------------------------------------------------
  // 1. System Settings
  // ----------------------------------------------------
  console.log('Creating system settings...');
  const settings = [
    { key: 'site_name', value: 'CashDash', type: 'string', category: 'general', label: 'Platform Name' },
    { key: 'support_email', value: 'support@cashdash.io', type: 'string', category: 'general', label: 'Support Email' },
    { key: 'currency_code', value: 'USD', type: 'string', category: 'general', label: 'Default Currency' },
    { key: 'points_conversion_rate', value: '10000', type: 'number', category: 'earning', label: 'Points per $1.00 USD' },
    { key: 'min_withdrawal_points', value: '5000', type: 'number', category: 'earning', label: 'Minimum Withdrawal Points' },
    { key: 'referral_percentage', value: '10', type: 'number', category: 'earning', label: 'Referral Commission %' },
    { key: 'daily_goal_default_points', value: '2000', type: 'number', category: 'earning', label: 'Daily Goal Points' },
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
    { slug: 'offer-master-100', name: 'Offer Legend', description: 'Complete 100 offers on CashDash', badgeColor: '#F59E0B', xpReward: 1000, requirement: { offersCount: 100 } },
    { slug: 'first-withdrawal', name: 'First Cashout', description: 'Request your first reward payout', badgeColor: '#10B981', xpReward: 100, requirement: { withdrawalsCount: 1 } },
    { slug: 'cashout-100', name: 'Century Club', description: 'Withdraw over $100 equivalent in rewards', badgeColor: '#06B6D4', xpReward: 500, requirement: { totalWithdrawnPoints: 1000000 } },
    { slug: 'referral-starter', name: 'Social Butterfly', description: 'Invite your first friend who earns points', badgeColor: '#F97316', xpReward: 100, requirement: { referralsCount: 1 } },
    { slug: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day active earning streak', badgeColor: '#EF4444', xpReward: 200, requirement: { streakDays: 7 } },
  ];

  for (const ach of achievements) {
    await prisma.achievement.create({ data: ach });
  }

  // ----------------------------------------------------
  // 3. Offer Providers
  // ----------------------------------------------------
  console.log('Creating mock offerwall providers...');
  const providerA = await prisma.offerProvider.create({
    data: {
      name: 'AdVenture Offerwall',
      type: 'offerwall',
      slug: 'mock-provider-a',
      apiKeyMasked: 'adv_live_••••••••••••3a9f',
      webhookSecret: 'mock-secret-a-change-in-production',
      postbackUrl: 'http://localhost:3001/api/v1/webhooks/providers/mock-provider-a',
      isActive: true,
      offersCount: 8,
    },
  });

  const providerB = await prisma.offerProvider.create({
    data: {
      name: 'RewardHub Media',
      type: 'offerwall',
      slug: 'mock-provider-b',
      apiKeyMasked: 'rhub_live_••••••••••••78b1',
      webhookSecret: 'mock-secret-b-change-in-production',
      postbackUrl: 'http://localhost:3001/api/v1/webhooks/providers/mock-provider-b',
      isActive: true,
      offersCount: 8,
    },
  });

  const providerC = await prisma.offerProvider.create({
    data: {
      name: 'TaskForce Digital',
      type: 'offerwall',
      slug: 'mock-provider-c',
      apiKeyMasked: 'tforce_••••••••••••22e4',
      webhookSecret: 'mock-secret-c-change-in-production',
      postbackUrl: 'http://localhost:3001/api/v1/webhooks/providers/mock-provider-c',
      isActive: true,
      offersCount: 6,
    },
  });

  const surveyProvider = await prisma.offerProvider.create({
    data: {
      name: 'InsightSurveys Global',
      type: 'survey',
      slug: 'mock-survey-provider',
      apiKeyMasked: 'isurv_••••••••••••99c3',
      webhookSecret: 'mock-survey-secret-change-in-production',
      postbackUrl: 'http://localhost:3001/api/v1/webhooks/providers/mock-survey-provider',
      isActive: true,
      offersCount: 6,
    },
  });

  const gameProvider = await prisma.offerProvider.create({
    data: {
      name: 'PlayForge Gaming',
      type: 'game',
      slug: 'mock-game-provider',
      apiKeyMasked: 'pforge_••••••••••••44d8',
      webhookSecret: 'mock-game-secret-change-in-production',
      postbackUrl: 'http://localhost:3001/api/v1/webhooks/providers/mock-game-provider',
      isActive: true,
      offersCount: 6,
    },
  });

  // ----------------------------------------------------
  // 4. Withdrawal Methods with Dynamic Requirements
  // ----------------------------------------------------
  console.log('Creating withdrawal methods...');
  const paypalMethod = await prisma.withdrawalMethod.create({
    data: {
      name: 'PayPal',
      slug: 'paypal',
      description: 'Fast and direct cash payment straight into your verified PayPal balance.',
      minimumPoints: 5000, // $0.50
      maximumPoints: 1000000, // $100.00
      feePercent: 0,
      processingTime: '1–24 hours',
      isActive: true,
      displayOrder: 1,
      requirements: {
        create: [
          {
            fieldName: 'paypalEmail',
            label: 'PayPal Email Address',
            type: WithdrawalFieldType.EMAIL,
            placeholder: 'your.paypal@example.com',
            helpText: 'Must match an active, verified PayPal account',
            isRequired: true,
            displayOrder: 1,
          },
          {
            fieldName: 'confirmEmail',
            label: 'Confirm PayPal Email',
            type: WithdrawalFieldType.EMAIL,
            placeholder: 'your.paypal@example.com',
            isRequired: true,
            displayOrder: 2,
          },
        ],
      },
    },
  });

  const cryptoMethod = await prisma.withdrawalMethod.create({
    data: {
      name: 'Crypto (USDT / BTC / LTC)',
      slug: 'crypto',
      description: 'Receive instant cryptocurrency payout to your personal non-custodial or exchange wallet.',
      minimumPoints: 10000, // $1.00
      maximumPoints: 5000000, // $500.00
      feePercent: 1.5,
      processingTime: 'Instant to 2 hours',
      isActive: true,
      displayOrder: 2,
      requirements: {
        create: [
          {
            fieldName: 'network',
            label: 'Cryptocurrency Network',
            type: WithdrawalFieldType.SELECT,
            placeholder: 'Select Network',
            options: ['USDT (TRC20 - Tron)', 'USDT (ERC20 - Ethereum)', 'Bitcoin (BTC)', 'Litecoin (LTC)'],
            isRequired: true,
            displayOrder: 1,
          },
          {
            fieldName: 'walletAddress',
            label: 'Destination Wallet Address',
            type: WithdrawalFieldType.TEXT,
            placeholder: 'Enter valid address matching chosen network',
            helpText: 'Please double-check. Crypto transactions cannot be reversed.',
            isRequired: true,
            displayOrder: 2,
          },
        ],
      },
    },
  });

  const giftCardMethod = await prisma.withdrawalMethod.create({
    data: {
      name: 'Digital Gift Cards',
      slug: 'gift-cards',
      description: 'Choose from Amazon, Apple, Google Play, Steam, and PlayStation digital redemption codes.',
      minimumPoints: 5000, // $0.50
      maximumPoints: 2000000, // $200.00
      feePercent: 0,
      processingTime: 'Instant to 6 hours',
      isActive: true,
      displayOrder: 3,
      requirements: {
        create: [
          {
            fieldName: 'brand',
            label: 'Gift Card Brand',
            type: WithdrawalFieldType.SELECT,
            placeholder: 'Select brand',
            options: ['Amazon Gift Card', 'Apple App Store', 'Google Play Store', 'Steam Wallet', 'PlayStation Store'],
            isRequired: true,
            displayOrder: 1,
          },
          {
            fieldName: 'region',
            label: 'Card Region / Currency',
            type: WithdrawalFieldType.SELECT,
            placeholder: 'Select country/region',
            options: ['United States (USD)', 'European Union (EUR)', 'United Kingdom (GBP)', 'Global (USD)'],
            isRequired: true,
            displayOrder: 2,
          },
          {
            fieldName: 'deliveryEmail',
            label: 'Recipient Email Address',
            type: WithdrawalFieldType.EMAIL,
            placeholder: 'delivery@example.com',
            helpText: 'The redemption code will be emailed here upon approval',
            isRequired: true,
            displayOrder: 3,
          },
        ],
      },
    },
  });

  const bankMethod = await prisma.withdrawalMethod.create({
    data: {
      name: 'Bank Transfer (SEPA / ACH / Wire)',
      slug: 'bank-transfer',
      description: 'Direct wire or local ACH/SEPA deposit directly into your checking account.',
      minimumPoints: 20000, // $2.00
      maximumPoints: 10000000, // $1000.00
      feePercent: 2.0,
      processingTime: '1–3 business days',
      isActive: true,
      displayOrder: 4,
      requirements: {
        create: [
          {
            fieldName: 'accountHolderName',
            label: 'Full Legal Account Holder Name',
            type: WithdrawalFieldType.TEXT,
            placeholder: 'Johnathan Doe',
            isRequired: true,
            displayOrder: 1,
          },
          {
            fieldName: 'bankName',
            label: 'Bank Name',
            type: WithdrawalFieldType.TEXT,
            placeholder: 'JPMorgan Chase / Barclays / Deutsche Bank',
            isRequired: true,
            displayOrder: 2,
          },
          {
            fieldName: 'accountNumber',
            label: 'Account Number / IBAN',
            type: WithdrawalFieldType.TEXT,
            placeholder: 'GB29 NWBK 6016 1331 9268 19 or routing/acct',
            isRequired: true,
            displayOrder: 3,
          },
          {
            fieldName: 'swiftBic',
            label: 'SWIFT / BIC / Routing Number',
            type: WithdrawalFieldType.TEXT,
            placeholder: 'SWIFT or 9-digit Routing',
            isRequired: true,
            displayOrder: 4,
          },
        ],
      },
    },
  });

  // ----------------------------------------------------
  // 5. Admin & Users
  // ----------------------------------------------------
  console.log('Creating admin and 25 realistic users...');
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
          country: 'US',
          bio: 'Platform Administrator & Risk Officer',
          isLeaderboardVisible: false,
        },
      },
      wallet: {
        create: {
          availablePoints: 250000,
          pendingPoints: 0,
          totalEarned: 500000,
          totalWithdrawn: 250000,
        },
      },
      userStreak: {
        create: { currentStreak: 30, longestStreak: 45 },
      },
      notificationPref: { create: {} },
    },
  });

  const demoUsersData = [
    { username: 'alex_dash', email: 'alex@example.com', country: 'US', points: 482000, withdrawn: 482000, streak: 14, offers: 32 },
    { username: 'mia_rewards', email: 'mia@example.com', country: 'UK', points: 451000, withdrawn: 451000, streak: 21, offers: 28 },
    { username: 'sam_earner', email: 'sam@example.com', country: 'CA', points: 412000, withdrawn: 412000, streak: 9, offers: 25 },
    { username: 'elena_crypto', email: 'elena@example.com', country: 'DE', points: 375000, withdrawn: 375000, streak: 12, offers: 22 },
    { username: 'david_surveys', email: 'david@example.com', country: 'FR', points: 340000, withdrawn: 340000, streak: 7, offers: 40 },
    { username: 'sarah_gamer', email: 'sarah@example.com', country: 'AU', points: 310000, withdrawn: 310000, streak: 18, offers: 19 },
    { username: 'marcus_tech', email: 'marcus@example.com', country: 'US', points: 285000, withdrawn: 285000, streak: 5, offers: 16 },
    { username: 'yuki_tokyo', email: 'yuki@example.com', country: 'JP', points: 260000, withdrawn: 260000, streak: 30, offers: 18 },
    { username: 'lucas_saopaulo', email: 'lucas@example.com', country: 'BR', points: 235000, withdrawn: 235000, streak: 8, offers: 15 },
    { username: 'chloe_points', email: 'chloe@example.com', country: 'NL', points: 210000, withdrawn: 210000, streak: 11, offers: 14 },
    { username: 'ryan_hustle', email: 'ryan@example.com', country: 'US', points: 12450, withdrawn: 85000, streak: 6, offers: 12 },
    { username: 'emma_quest', email: 'emma@example.com', country: 'CA', points: 45200, withdrawn: 60000, streak: 4, offers: 10 },
    { username: 'noah_cash', email: 'noah@example.com', country: 'UK', points: 18900, withdrawn: 40000, streak: 3, offers: 8 },
    { username: 'olivia_vault', email: 'olivia@example.com', country: 'US', points: 32400, withdrawn: 30000, streak: 9, offers: 9 },
    { username: 'liam_fast', email: 'liam@example.com', country: 'SE', points: 8500, withdrawn: 25000, streak: 2, offers: 5 },
    { username: 'sophia_earn', email: 'sophia@example.com', country: 'ES', points: 15200, withdrawn: 20000, streak: 5, offers: 6 },
    { username: 'ethan_loot', email: 'ethan@example.com', country: 'IT', points: 7600, withdrawn: 15000, streak: 1, offers: 4 },
    { username: 'isabella_win', email: 'isabella@example.com', country: 'US', points: 24000, withdrawn: 10000, streak: 7, offers: 7 },
    { username: 'mason_drop', email: 'mason@example.com', country: 'AU', points: 5100, withdrawn: 5000, streak: 0, offers: 2 },
    { username: 'harper_flow', email: 'harper@example.com', country: 'NZ', points: 11200, withdrawn: 5000, streak: 4, offers: 3 },
    { username: 'jack_alpha', email: 'jack@example.com', country: 'US', points: 6500, withdrawn: 0, streak: 2, offers: 2 },
    { username: 'zoe_blaze', email: 'zoe@example.com', country: 'CA', points: 4200, withdrawn: 0, streak: 1, offers: 1 },
    { username: 'leo_strike', email: 'leo@example.com', country: 'UK', points: 8900, withdrawn: 0, streak: 3, offers: 3 },
    { username: 'nora_swift', email: 'nora@example.com', country: 'DE', points: 1200, withdrawn: 0, streak: 1, offers: 1 },
    { username: 'test_user', email: 'user@cashdash.io', country: 'US', points: 12450, withdrawn: 15000, streak: 5, offers: 8 },
  ];

  const createdUsers: any[] = [];

  for (const u of demoUsersData) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        username: u.username,
        passwordHash: passwordHashUser,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        referralCode: `REF-${u.username.toUpperCase().replace('_', '')}`,
        profile: {
          create: {
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
            country: u.country,
            bio: `Earning with CashDash from ${u.country}`,
            isLeaderboardVisible: true,
          },
        },
        wallet: {
          create: {
            availablePoints: u.points,
            pendingPoints: Math.floor(u.points * 0.1),
            totalEarned: u.points + u.withdrawn,
            totalWithdrawn: u.withdrawn,
          },
        },
        userStreak: {
          create: {
            currentStreak: u.streak,
            longestStreak: u.streak + 5,
            lastActiveAt: new Date(),
          },
        },
        notificationPref: { create: {} },
        riskAssessment: {
          create: {
            riskLevel: RiskLevel.LOW,
            riskStatus: RiskStatus.CLEAR,
            riskScore: 12,
          },
        },
      },
      include: { wallet: true },
    });
    createdUsers.push(user);
  }

  // ----------------------------------------------------
  // 6. Offers (32 diverse, realistic offers)
  // ----------------------------------------------------
  console.log('Creating 32 realistic offers...');
  const offersList = [
    // Games
    {
      title: 'Raid: Shadow Legends - Reach Lv 40',
      description: 'Install Raid: Shadow Legends, defeat normal campaign and reach player level 40 within 21 days.',
      category: OfferCategory.GAMES,
      providerId: providerA.id,
      rewardPoints: 45000,
      estimatedMinutes: 120,
      difficulty: OfferDifficulty.HARD,
      countries: ['US', 'CA', 'UK', 'DE', 'FR', 'AU'],
      requirements: ['New users only', 'Reach player Level 40 in 21 days', 'No emulator or VPN allowed'],
      iconUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=128&auto=format&fit=crop&q=80',
      isFeatured: true,
      isRecommended: true,
    },
    {
      title: 'Monopoly GO! - Board 15',
      description: 'Download Monopoly GO!, build properties and clear Board 15 within 14 days of install.',
      category: OfferCategory.GAMES,
      providerId: gameProvider.id,
      rewardPoints: 28000,
      estimatedMinutes: 60,
      difficulty: OfferDifficulty.MEDIUM,
      countries: ['US', 'CA', 'UK'],
      requirements: ['Install through our link', 'Reach and complete Board 15', 'Must complete within 14 days'],
      iconUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=128&auto=format&fit=crop&q=80',
      isFeatured: true,
      isRecommended: true,
    },
    {
      title: 'Rise of Kingdoms - City Hall 17',
      description: 'Construct and upgrade your Governor City Hall to Level 17 within 25 days.',
      category: OfferCategory.GAMES,
      providerId: providerA.id,
      rewardPoints: 52000,
      estimatedMinutes: 180,
      difficulty: OfferDifficulty.HARD,
      countries: ['US', 'DE', 'UK', 'FR'],
      requirements: ['Upgrade City Hall to Lv 17', 'In-app purchases optional but accelerate progress', 'New players only'],
      iconUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: true,
    },
    {
      title: 'Candy Crush Saga - Pass Level 100',
      description: 'Complete 100 sweet candy puzzle stages to receive instant reward points.',
      category: OfferCategory.GAMES,
      providerId: gameProvider.id,
      rewardPoints: 12000,
      estimatedMinutes: 45,
      difficulty: OfferDifficulty.EASY,
      countries: ['US', 'CA', 'UK', 'AU', 'NZ'],
      requirements: ['Complete level 100', 'Valid on iOS & Android', '7 day time limit'],
      iconUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: false,
    },
    {
      title: 'Mech Arena - 50 Battle Victories',
      description: 'Pilot your mechs, gear up weapons, and win 50 online PvP battles.',
      category: OfferCategory.GAMES,
      providerId: gameProvider.id,
      rewardPoints: 34000,
      estimatedMinutes: 90,
      difficulty: OfferDifficulty.MEDIUM,
      countries: ['US', 'UK', 'CA'],
      requirements: ['Win 50 PvP match rounds', 'Guest accounts not credited - link Google/Apple ID'],
      iconUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: false,
    },
    {
      title: 'Coin Master - Village 10',
      description: 'Spin the wheel, raid friends, and build up to Village 10.',
      category: OfferCategory.GAMES,
      providerId: providerA.id,
      rewardPoints: 18000,
      estimatedMinutes: 40,
      difficulty: OfferDifficulty.EASY,
      countries: ['US', 'CA', 'UK', 'AU'],
      requirements: ['Build Village 10', 'First-time downloads only'],
      iconUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: false,
    },

    // Surveys
    {
      title: 'Consumer Tech & Gadgets Survey 2026',
      description: 'Share your genuine feedback on smart home devices and consumer electronics in this 15-min survey.',
      category: OfferCategory.SURVEYS,
      providerId: surveyProvider.id,
      rewardPoints: 2400,
      estimatedMinutes: 15,
      difficulty: OfferDifficulty.EASY,
      countries: ['US', 'CA', 'UK', 'DE', 'AU'],
      requirements: ['Answer all questions attentively', 'Quality check questions must be passed', 'One completion per user'],
      iconUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&auto=format&fit=crop&q=80',
      isFeatured: true,
      isRecommended: true,
    },
    {
      title: 'Streaming & Entertainment Habits Study',
      description: 'Tell top media companies what shows, music, and streaming services you watch and pay for.',
      category: OfferCategory.SURVEYS,
      providerId: surveyProvider.id,
      rewardPoints: 1800,
      estimatedMinutes: 10,
      difficulty: OfferDifficulty.EASY,
      countries: ['US', 'UK'],
      requirements: ['Ages 18+', 'Must actively use at least one streaming service'],
      iconUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: true,
    },
    {
      title: 'Global Financial Habits & Banking Survey',
      description: 'Comprehensive 20-minute survey regarding your credit card, fintech app, and investment choices.',
      category: OfferCategory.SURVEYS,
      providerId: surveyProvider.id,
      rewardPoints: 3500,
      estimatedMinutes: 20,
      difficulty: OfferDifficulty.MEDIUM,
      countries: ['US', 'CA', 'UK', 'DE', 'FR'],
      requirements: ['Must hold active bank account', 'Consistent answers required throughout survey'],
      iconUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: false,
    },
    {
      title: 'Automotive Trends & EV Preferences',
      description: 'Express your opinion on electric vehicles, car ownership, and daily commuting habits.',
      category: OfferCategory.SURVEYS,
      providerId: surveyProvider.id,
      rewardPoints: 2100,
      estimatedMinutes: 12,
      difficulty: OfferDifficulty.EASY,
      countries: ['US', 'DE', 'JP', 'UK'],
      requirements: ['Valid driver license holder'],
      iconUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: false,
    },
    {
      title: 'Quick 5-Minute Daily Brand Poll',
      description: 'Fast pulse poll evaluating brand recognition of international retail and food logos.',
      category: OfferCategory.SURVEYS,
      providerId: surveyProvider.id,
      rewardPoints: 600,
      estimatedMinutes: 5,
      difficulty: OfferDifficulty.EASY,
      countries: ['US', 'CA', 'UK', 'AU', 'NZ', 'DE'],
      requirements: ['Pass attention checks', 'Instant credit upon final screen'],
      iconUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: true,
    },

    // Apps & Finance
    {
      title: 'Revolut - Sign Up & First Card Payment',
      description: 'Open a standard free Revolut account, verify identity and execute a single card purchase of at least $5.',
      category: OfferCategory.FINANCE,
      providerId: providerB.id,
      rewardPoints: 65000,
      estimatedMinutes: 25,
      difficulty: OfferDifficulty.MEDIUM,
      countries: ['US', 'UK', 'DE', 'FR', 'ES', 'IT', 'NL'],
      requirements: ['KYC verification required', 'Must complete 1 card payment', 'First-time Revolut customers only'],
      iconUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=128&auto=format&fit=crop&q=80',
      isFeatured: true,
      isRecommended: true,
    },
    {
      title: 'Robinhood - Open Account & Fund $1',
      description: 'Download the Robinhood app, link checking account and deposit minimum $1.00 USD.',
      category: OfferCategory.FINANCE,
      providerId: providerB.id,
      rewardPoints: 50000,
      estimatedMinutes: 15,
      difficulty: OfferDifficulty.MEDIUM,
      countries: ['US'],
      requirements: ['US residents 18+', 'Approved brokerage application', 'Initial deposit of $1+ required'],
      iconUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=128&auto=format&fit=crop&q=80',
      isFeatured: true,
      isRecommended: false,
    },
    {
      title: 'Crypto.com - Buy $20 of Any Crypto',
      description: 'Register with Crypto.com, pass ID check and purchase $20 worth of crypto to unlock massive reward.',
      category: OfferCategory.FINANCE,
      providerId: providerB.id,
      rewardPoints: 85000,
      estimatedMinutes: 30,
      difficulty: OfferDifficulty.HARD,
      countries: ['US', 'CA', 'UK', 'AU'],
      requirements: ['New users only', 'ID verification required', 'Minimum $20 purchase'],
      iconUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: true,
    },
    {
      title: 'Acorns - Invest Your Spare Change',
      description: 'Set up an automated micro-investing account and make your initial recurring $5 investment.',
      category: OfferCategory.FINANCE,
      providerId: providerB.id,
      rewardPoints: 40000,
      estimatedMinutes: 15,
      difficulty: OfferDifficulty.EASY,
      countries: ['US'],
      requirements: ['Fund account with $5', 'Keep active for 14 days'],
      iconUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: false,
    },

    // Apps & Utilities
    {
      title: 'NordVPN - Secure 2-Year Plan',
      description: 'Protect your internet privacy with the leading global VPN service and get rewarded.',
      category: OfferCategory.APPS,
      providerId: providerC.id,
      rewardPoints: 75000,
      estimatedMinutes: 10,
      difficulty: OfferDifficulty.EASY,
      countries: ['US', 'CA', 'UK', 'DE', 'AU', 'FR'],
      requirements: ['Subscribe to any 1 or 2-year plan', 'Valid payment method required'],
      iconUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=128&auto=format&fit=crop&q=80',
      isFeatured: true,
      isRecommended: true,
    },
    {
      title: 'Duolingo - 7-Day Free Super Trial',
      description: 'Start learning a new foreign language with Duolingo and activate the 7-day Super trial.',
      category: OfferCategory.APPS,
      providerId: providerC.id,
      rewardPoints: 8500,
      estimatedMinutes: 10,
      difficulty: OfferDifficulty.EASY,
      countries: ['US', 'CA', 'UK', 'AU'],
      requirements: ['Activate free 7-day trial', 'Complete lesson 1', 'Cancel anytime'],
      iconUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: true,
    },
    {
      title: 'TikTok - Install & Browse 15 Mins',
      description: 'Download the TikTok app, create an account and browse video feed for 15 minutes.',
      category: OfferCategory.APPS,
      providerId: providerC.id,
      rewardPoints: 5500,
      estimatedMinutes: 15,
      difficulty: OfferDifficulty.EASY,
      countries: ['US', 'UK', 'CA'],
      requirements: ['Brand new device installs only', 'Must engage with at least 5 videos'],
      iconUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: false,
    },
    {
      title: 'Audible - 30-Day Free Audiobook Trial',
      description: 'Enjoy 2 free bestselling audiobooks and keep them forever with an Amazon Audible trial.',
      category: OfferCategory.TRIALS,
      providerId: providerC.id,
      rewardPoints: 15000,
      estimatedMinutes: 10,
      difficulty: OfferDifficulty.EASY,
      countries: ['US', 'UK', 'CA', 'AU', 'DE'],
      requirements: ['Start 30-day trial', 'Amazon account required', 'Cancel anytime during trial'],
      iconUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: true,
    },

    // Shopping & Sign-up
    {
      title: 'Temu - First Order with Discount',
      description: 'Shop quality trending products and make your first verified purchase of $10 or more.',
      category: OfferCategory.SHOPPING,
      providerId: providerB.id,
      rewardPoints: 32000,
      estimatedMinutes: 20,
      difficulty: OfferDifficulty.MEDIUM,
      countries: ['US', 'CA', 'UK', 'AU', 'DE', 'FR'],
      requirements: ['Complete initial purchase above $10', 'Delivered order verified before crediting'],
      iconUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=128&auto=format&fit=crop&q=80',
      isFeatured: true,
      isRecommended: false,
    },
    {
      title: 'Disney+ Monthly Subscription',
      description: 'Subscribe to Disney+ streaming service and unlock all Marvel, Star Wars, and Pixar classics.',
      category: OfferCategory.SIGN_UP,
      providerId: providerC.id,
      rewardPoints: 22000,
      estimatedMinutes: 10,
      difficulty: OfferDifficulty.EASY,
      countries: ['US', 'UK', 'CA'],
      requirements: ['Sign up for 1 month subscription', 'Valid debit/credit card required'],
      iconUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: false,
    },
    {
      title: 'Uber Eats - First Food Delivery Order',
      description: 'Order your favorite meal delivered to your doorstep and earn CashDash points back.',
      category: OfferCategory.SHOPPING,
      providerId: providerB.id,
      rewardPoints: 25000,
      estimatedMinutes: 15,
      difficulty: OfferDifficulty.EASY,
      countries: ['US', 'CA', 'UK', 'AU'],
      requirements: ['First-time Uber Eats customer', 'Minimum $15 food order'],
      iconUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: true,
    },
    {
      title: 'HelloFresh - Get 50% Off First Box',
      description: 'Receive fresh farm-to-table pre-portioned meal ingredients and easy step recipes at home.',
      category: OfferCategory.SHOPPING,
      providerId: providerB.id,
      rewardPoints: 48000,
      estimatedMinutes: 15,
      difficulty: OfferDifficulty.MEDIUM,
      countries: ['US', 'UK', 'DE', 'CA', 'AU'],
      requirements: ['Subscribe to first weekly delivery', 'Cannot be combined with other affiliate coupons'],
      iconUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: false,
    },
    {
      title: 'Skillshare - 1 Month Free Creative Class Trial',
      description: 'Explore thousands of inspiring design, video editing, illustration and business classes.',
      category: OfferCategory.TRIALS,
      providerId: providerC.id,
      rewardPoints: 11000,
      estimatedMinutes: 10,
      difficulty: OfferDifficulty.EASY,
      countries: ['US', 'CA', 'UK', 'AU', 'EU'],
      requirements: ['Start 1 month trial', 'Watch at least 1 full lesson (15 mins)'],
      iconUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
      isFeatured: false,
      isRecommended: false,
    },
  ];

  const createdOffers: any[] = [];
  for (const off of offersList) {
    const created = await prisma.offer.create({
      data: {
        ...off,
        status: OfferStatus.ACTIVE,
        trackingUrl: `https://track.mocknetwork.com/click?offer_id=${off.title.slice(0, 5)}&user_id={user_id}`,
      },
    });
    createdOffers.push(created);
  }

  // ----------------------------------------------------
  // 7. Ledger Transactions, Withdrawals, Notifications
  // ----------------------------------------------------
  console.log('Generating realistic transaction history and withdrawals...');

  for (let i = 0; i < 15; i++) {
    const user = createdUsers[i];
    const offer = createdOffers[i % createdOffers.length];

    // Offer completion record
    await prisma.offerCompletion.create({
      data: {
        userId: user.id,
        offerId: offer.id,
        providerId: offer.providerId,
        externalTxId: `EXT-TX-${Date.now()}-${i}`,
        status: OfferCompletionStatus.COMPLETED,
        rewardPoints: offer.rewardPoints,
        completedAt: new Date(Date.now() - (i + 1) * 3600 * 1000 * 12),
      },
    });

    // Ledger transaction (credit)
    await prisma.ledgerTransaction.create({
      data: {
        userId: user.id,
        walletId: user.wallet.id,
        type: TransactionType.OFFER_REWARD,
        direction: TransactionDirection.CREDIT,
        amount: offer.rewardPoints,
        status: TransactionStatus.COMPLETED,
        source: 'offer',
        referenceId: offer.id,
        description: `Reward for completing '${offer.title}'`,
        createdAt: new Date(Date.now() - (i + 1) * 3600 * 1000 * 12),
      },
    });

    // Notification for reward
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: NotificationType.REWARD_ADDED,
        title: `+${new Intl.NumberFormat().format(offer.rewardPoints)} Points Added!`,
        message: `Your offer '${offer.title}' was verified and credited to your wallet.`,
        isRead: i > 5,
        link: '/wallet',
        createdAt: new Date(Date.now() - (i + 1) * 3600 * 1000 * 12),
      },
    });
  }

  // Realistic Completed Withdrawals for the Top 10 users
  console.log('Creating realistic withdrawal requests...');
  for (let i = 0; i < 10; i++) {
    const user = createdUsers[i];
    const withdrawalAmount = user.wallet.totalWithdrawn;
    if (withdrawalAmount > 0) {
      const method = i % 2 === 0 ? paypalMethod : cryptoMethod;
      const w = await prisma.withdrawalRequest.create({
        data: {
          userId: user.id,
          methodId: method.id,
          points: withdrawalAmount,
          netPoints: withdrawalAmount,
          cashValue: withdrawalAmount / 10000,
          status: WithdrawalStatus.PAID,
          destination: {
            paypalEmail: `${user.username}@example.com`,
            walletAddress: '0x71C...392F',
            network: 'USDT (TRC20)',
          },
          externalTxId: `PAYOUT-ID-${100000 + i}`,
          riskScore: 5,
          createdAt: new Date(Date.now() - (15 - i) * 24 * 3600 * 1000),
          statusHistory: {
            create: [
              { fromStatus: null, toStatus: WithdrawalStatus.PENDING, note: 'User submitted withdrawal request' },
              { fromStatus: WithdrawalStatus.PENDING, toStatus: WithdrawalStatus.PROCESSING, note: 'Automated batch review approved' },
              { fromStatus: WithdrawalStatus.PROCESSING, toStatus: WithdrawalStatus.PAID, note: 'Payment processed via mock gateway' },
            ],
          },
        },
      });

      // Ledger entry for withdrawal
      await prisma.ledgerTransaction.create({
        data: {
          userId: user.id,
          walletId: user.wallet.id,
          type: TransactionType.WITHDRAWAL,
          direction: TransactionDirection.DEBIT,
          amount: withdrawalAmount,
          status: TransactionStatus.COMPLETED,
          source: 'withdrawal',
          referenceId: w.id,
          description: `Withdrawal via ${method.name}`,
          createdAt: w.createdAt,
        },
      });
    }
  }

  // Pending / Processing withdrawals for other users
  const pendingUser = createdUsers[10];
  await prisma.withdrawalRequest.create({
    data: {
      userId: pendingUser.id,
      methodId: paypalMethod.id,
      points: 10000,
      netPoints: 10000,
      cashValue: 1.0,
      status: WithdrawalStatus.PENDING,
      destination: { paypalEmail: `${pendingUser.username}@example.com` },
      riskScore: 10,
      statusHistory: {
        create: [{ fromStatus: null, toStatus: WithdrawalStatus.PENDING, note: 'Awaiting admin review' }],
      },
    },
  });

  const processingUser = createdUsers[11];
  await prisma.withdrawalRequest.create({
    data: {
      userId: processingUser.id,
      methodId: cryptoMethod.id,
      points: 25000,
      feePoints: 375,
      netPoints: 24625,
      cashValue: 2.5,
      status: WithdrawalStatus.PROCESSING,
      destination: { walletAddress: 'TV7kZ...88k1', network: 'USDT (TRC20)' },
      riskScore: 8,
      statusHistory: {
        create: [
          { fromStatus: null, toStatus: WithdrawalStatus.PENDING, note: 'Submitted' },
          { fromStatus: WithdrawalStatus.PENDING, toStatus: WithdrawalStatus.PROCESSING, note: 'Sent to crypto gateway' },
        ],
      },
    },
  });

  // ----------------------------------------------------
  // 8. Leaderboard Snapshots
  // ----------------------------------------------------
  console.log('Calculating leaderboard snapshots...');
  const top10Users = [...createdUsers].sort((a, b) => b.wallet.totalWithdrawn - a.wallet.totalWithdrawn).slice(0, 10);

  for (let rank = 0; rank < top10Users.length; rank++) {
    const user = top10Users[rank];
    await prisma.leaderboardSnapshot.create({
      data: {
        userId: user.id,
        metric: LeaderboardMetric.TOTAL_WITHDRAWN,
        value: user.wallet.totalWithdrawn,
        rank: rank + 1,
        period: 'all-time',
      },
    });
  }

  // ----------------------------------------------------
  // 9. Support Tickets
  // ----------------------------------------------------
  console.log('Creating sample support tickets...');
  const ticketUser = createdUsers[10];
  await prisma.supportTicket.create({
    data: {
      userId: ticketUser.id,
      subject: 'Offer completion delay for Raid Shadow Legends',
      category: TicketCategory.OFFER_ISSUE,
      status: TicketStatus.WAITING_FOR_USER,
      priority: 'normal',
      messages: {
        create: [
          {
            authorId: ticketUser.id,
            isStaff: false,
            content: 'Hello, I completed player level 40 on Raid: Shadow Legends yesterday evening, but the points are still showing as pending. Could you check please?',
          },
          {
            authorId: adminUser.id,
            isStaff: true,
            content: 'Hi Ryan, thank you for reaching out! We see the postback from AdVenture Offerwall is in pending state. It usually clears within 24-48 hours. Please provide a screenshot of your player profile if it does not credit by tomorrow.',
          },
        ],
      },
    },
  });

  // ----------------------------------------------------
  // 10. Audit Logs
  // ----------------------------------------------------
  console.log('Creating audit logs...');
  await prisma.auditLog.create({
    data: {
      adminId: adminUser.id,
      action: AuditAction.SETTINGS_UPDATED,
      entityType: 'SystemSetting',
      entityId: 'points_conversion_rate',
      previousValue: { rate: 10000 },
      newValue: { rate: 10000 },
      metadata: { reason: 'System initialization and verification' },
    },
  });

  await prisma.auditLog.create({
    data: {
      adminId: adminUser.id,
      action: AuditAction.WITHDRAWAL_METHOD_CREATED,
      entityType: 'WithdrawalMethod',
      entityId: paypalMethod.id,
      newValue: { name: 'PayPal', minPoints: 5000 },
      metadata: { initialSetup: true },
    },
  });

  console.log('✅ CashDash database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('🔑 Admin Account: admin@cashdash.io / Admin@CashDash2024!');
  console.log('👤 Demo User:     user@cashdash.io  / Password123!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
