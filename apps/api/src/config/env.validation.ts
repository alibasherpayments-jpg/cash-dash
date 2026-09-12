import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  API_PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  COOKIE_SECRET: z.string().min(8),
  EMAIL_FROM: z.string().email().default('noreply@cashdash.io'),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MOCK_PROVIDER_A_SECRET: z.string().default('mock-secret-a'),
  MOCK_PROVIDER_B_SECRET: z.string().default('mock-secret-b'),
  MOCK_SURVEY_PROVIDER_SECRET: z.string().default('mock-survey-secret'),
  MOCK_GAME_PROVIDER_SECRET: z.string().default('mock-game-secret'),
  ADMIN_EMAIL: z.string().email().default('admin@cashdash.io'),
  ADMIN_PASSWORD: z.string().default('Admin@CashDash2024!'),
  ADMIN_USERNAME: z.string().default('admin'),
});

export type Env = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const messages = Object.entries(errors)
      .map(([key, msgs]) => `${key}: ${msgs?.join(', ')}`)
      .join('\n');
    throw new Error(`❌ Invalid environment variables:\n${messages}`);
  }
  return result.data;
}
