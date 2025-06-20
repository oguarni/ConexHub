import config from '../src/config/index.js';

describe('Configuration System', () => {
  test('should load configuration successfully', () => {
    expect(config).toBeDefined();
    expect(config.NODE_ENV).toBe('test');
    expect(config.JWT_SECRET).toBeDefined();
    expect(config.DATABASE_URL).toBeDefined();
  });

  test('should have proper environment helper functions', () => {
    expect(typeof config.isDevelopment).toBe('function');
    expect(typeof config.isProduction).toBe('function');
    expect(typeof config.isTest).toBe('function');
    
    expect(config.isTest()).toBe(true);
    expect(config.isDevelopment()).toBe(false);
    expect(config.isProduction()).toBe(false);
  });

  test('should have required configuration properties', () => {
    expect(config.PORT).toBeDefined();
    expect(config.API_PREFIX).toBeDefined();
    expect(config.FRONTEND_URL).toBeDefined();
    expect(config.JWT_SECRET.length).toBeGreaterThan(32);
  });

  test('should generate secure JWT secrets', () => {
    const secret1 = config.generateSecureJwtSecret();
    const secret2 = config.generateSecureJwtSecret();
    
    expect(secret1).toBeDefined();
    expect(secret2).toBeDefined();
    expect(secret1.length).toBeGreaterThanOrEqual(64);
    expect(secret2.length).toBeGreaterThanOrEqual(64);
    expect(secret1).not.toBe(secret2); // Should be different each time
  });

  test('should provide config report', () => {
    const report = config.getConfigReport();
    
    expect(report).toBeDefined();
    expect(report.environment).toBe('test');
    expect(report.features).toBeDefined();
    expect(report.security).toBeDefined();
    expect(report.integrations).toBeDefined();
  });

  test('should mask sensitive values', () => {
    const sensitiveValue = 'super-secret-password-123';
    const masked = config.maskSensitiveValue(sensitiveValue);
    
    expect(masked).not.toBe(sensitiveValue);
    expect(masked).toContain('*');
    expect(masked.length).toBeLessThanOrEqual(sensitiveValue.length);
  });
});