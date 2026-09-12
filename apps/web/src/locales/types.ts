export type Locale = "ar" | "en" | "de" | "ja" | "es";

export interface LanguageConfig {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
  country: string;
  dir: "ltr" | "rtl";
}

export interface TranslationSchema {
  common: {
    dashboard: string;
    offers: string;
    offerwalls: string;
    wallet: string;
    withdraw: string;
    history: string;
    leaderboard: string;
    achievements: string;
    referrals: string;
    notifications: string;
    support: string;
    profile: string;
    logout: string;
    availableBalance: string;
    points: string;
    pts: string;
    usd: string;
    save: string;
    saving: string;
    saved: string;
    cancel: string;
    confirm: string;
    close: string;
    loading: string;
    search: string;
    status: string;
    active: string;
    pending: string;
    completed: string;
    rejected: string;
    processing: string;
    paid: string;
    viewAll: string;
    filter: string;
    all: string;
    unread: string;
    pointsSymbol: string;
  };
  nav: {
    features: string;
    howItWorks: string;
    faq: string;
    signIn: string;
    getStarted: string;
    adminConsole: string;
    language: string;
    selectLanguage: string;
  };
  profile: {
    title: string;
    subtitle: string;
    accountStatus: string;
    verified: string;
    memberSince: string;
    tabs: {
      personal: string;
      security: string;
      preferences: string;
      privacy: string;
      language: string;
    };
    languageSection: {
      title: string;
      description: string;
      currentLanguage: string;
      selectPrompt: string;
      instantNotice: string;
      activeBadge: string;
      languages: {
        ar: { name: string; nativeName: string; country: string };
        en: { name: string; nativeName: string; country: string };
        de: { name: string; nativeName: string; country: string };
        ja: { name: string; nativeName: string; country: string };
        es: { name: string; nativeName: string; country: string };
      };
    };
    personal: {
      title: string;
      desc: string;
      username: string;
      email: string;
      bio: string;
      country: string;
      saveButton: string;
    };
    security: {
      title: string;
      desc: string;
      currentPass: string;
      newPass: string;
      confirmPass: string;
      updatePass: string;
    };
    notifications: {
      title: string;
      desc: string;
      rewardAlerts: string;
      rewardAlertsDesc: string;
      withdrawalAlerts: string;
      withdrawalAlertsDesc: string;
    };
  };
  dashboard: {
    welcome: string;
    balanceOverview: string;
    totalEarned: string;
    offersCompleted: string;
    quickActions: string;
    browseOffers: string;
    cashout: string;
    inviteFriends: string;
    recentActivity: string;
    noActivity: string;
    viewLedger: string;
  };
  wallet: {
    title: string;
    subtitle: string;
    requestCashout: string;
    availableBalance: string;
    pendingPoints: string;
    pendingNote: string;
    lifetimeEarned: string;
    totalWithdrawn: string;
    ledgerTitle: string;
    filterTabs: {
      all: string;
      offers: string;
      withdrawals: string;
      referrals: string;
      surveys: string;
    };
    noTransactions: string;
    noTransactionsDesc: string;
    exploreOffers: string;
  };
  transactions: {
    types: {
      OFFER_REWARD: string;
      SURVEY_REWARD: string;
      REFERRAL_REWARD: string;
      DAILY_BONUS: string;
      PROMOTIONAL_BONUS: string;
      WITHDRAWAL: string;
      WITHDRAWAL_REVERSAL: string;
      ADMIN_ADJUSTMENT: string;
    };
    credit: string;
    debit: string;
  };
  notifications: {
    title: string;
    subtitle: string;
    markAllRead: string;
    allUpdates: string;
    unreadOnly: string;
    noNotifications: string;
    noNotificationsDesc: string;
    browseOffers: string;
    liveAlertsBanner: {
      title: string;
      badge: string;
      desc: string;
    };
  };
  offerAlerts: {
    buttonTitle: string;
    popoverTitle: string;
    popoverDesc: string;
    toggleLabel: string;
    soundLabel: string;
    soundDesc: string;
    testButton: string;
    testing: string;
    testNotice: string;
    browserPermAlert: string;
    browserPermDesc: string;
    enableBrowserBtn: string;
    testRewardTitle: string;
    testRewardMessage: string;
    enabledToast: string;
    disabledToast: string;
  };
  withdraw: {
    title: string;
    subtitle: string;
    balanceCard: string;
    historyButton: string;
    selectMethod: string;
    minWithdrawal: string;
    fee: string;
    processingTime: string;
    enterAmount: string;
    pointsToWithdraw: string;
    willReceive: string;
    submitRequest: string;
    confirmTitle: string;
    confirmDesc: string;
    confirmButton: string;
    insufficientBalance: string;
    belowMinimum: string;
    successToast: string;
  };
  withdrawHistory: {
    title: string;
    subtitle: string;
    backToWithdraw: string;
    table: {
      method: string;
      amount: string;
      fee: string;
      status: string;
      date: string;
      id: string;
    };
    noHistory: string;
    noHistoryDesc: string;
  };
  offers: {
    title: string;
    subtitle: string;
    featured: string;
    allOffers: string;
    startOffer: string;
    requirements: string;
    reward: string;
    searchPlaceholder: string;
    sort: {
      label: string;
      recommended: string;
      highestReward: string;
      lowestReward: string;
      fastest: string;
    };
    categories: {
      ALL: string;
      GAMES: string;
      SURVEYS: string;
      APPS: string;
      FINANCE: string;
      SHOPPING: string;
      TRIALS: string;
    };
    noOffers: string;
    noOffersDesc: string;
  };
  offerwalls: {
    title: string;
    subtitle: string;
    openWall: string;
    openNewWindow: string;
    modalTitle: string;
    modalSubtitle: string;
    instructions: string;
    close: string;
  };
  leaderboard: {
    title: string;
    subtitle: string;
    tabs: {
      withdrawn: string;
      earners: string;
    };
    rank: string;
    user: string;
    totalWithdrawn: string;
    totalEarned: string;
    country: string;
    noData: string;
  };

  support: {
    title: string;
    subtitle: string;
    newTicket: string;
    subject: string;
    message: string;
    status: string;
    open: string;
    resolved: string;
    closed: string;
  };
}
