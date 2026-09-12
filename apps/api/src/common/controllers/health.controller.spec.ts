import { describe, it, expect } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  const controller = new HealthController();

  it('should return status ok and platform metadata', () => {
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('cashdash-api');
    expect(result.version).toBe('1.0.0');
    expect(typeof result.uptimeSeconds).toBe('number');
    expect(typeof result.timestamp).toBe('string');
  });
});
