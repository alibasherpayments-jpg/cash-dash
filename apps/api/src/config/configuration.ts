export default () => ({
  app: {
    port: parseInt(process.env['API_PORT'] ?? '3001', 10),
    frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    apiUrl: process.env['API_URL'] ?? 'http://localhost:3001',
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
  },
  database: {
    url: process.env['DATABASE_URL'],
  },
  redis: {
    url: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
  },
  jwt: {
    accessSecret: process.env['JWT_ACCESS_SECRET'],
    refreshSecret: process.env['JWT_REFRESH_SECRET'],
    accessExpiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15m',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
  },
  cookie: {
    secret: process.env['COOKIE_SECRET'],
  },
  email: {
    from: process.env['EMAIL_FROM'] ?? 'noreply@cashdash.io',
    smtpHost: process.env['SMTP_HOST'] ?? 'localhost',
    smtpPort: parseInt(process.env['SMTP_PORT'] ?? '1025', 10),
    smtpUser: process.env['SMTP_USER'],
    smtpPass: process.env['SMTP_PASS'],
  },
  providers: {
    mockProviderASecret: process.env['MOCK_PROVIDER_A_SECRET'] ?? 'mock-secret-a',
    mockProviderBSecret: process.env['MOCK_PROVIDER_B_SECRET'] ?? 'mock-secret-b',
    mockSurveySecret: process.env['MOCK_SURVEY_PROVIDER_SECRET'] ?? 'mock-survey-secret',
    mockGameSecret: process.env['MOCK_GAME_PROVIDER_SECRET'] ?? 'mock-game-secret',
  },
  admin: {
    email: process.env['ADMIN_EMAIL'] ?? 'admin@cashdash.io',
    password: process.env['ADMIN_PASSWORD'] ?? 'Admin@CashDash2024!',
    username: process.env['ADMIN_USERNAME'] ?? 'admin',
  },
});
