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
    viewAll: string;
    filter: string;
    all: string;
    unread: string;
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
  offers: {
    title: string;
    subtitle: string;
    featured: string;
    allOffers: string;
    startOffer: string;
    requirements: string;
    reward: string;
  };
  withdraw: {
    title: string;
    subtitle: string;
    selectMethod: string;
    enterAmount: string;
    minWithdrawal: string;
    submitRequest: string;
    processingTime: string;
    fee: string;
  };
  alerts: {
    liveTitle: string;
    liveSubtitle: string;
    enabledNotice: string;
    disabledNotice: string;
    testAlert: string;
  };
}
