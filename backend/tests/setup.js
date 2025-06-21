// Test setup file for Jest
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set test environment variables BEFORE loading config
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_URL = 'sqlite:///:memory:';
process.env.JWT_SECRET = 'Test123!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
process.env.JWT_REFRESH_SECRET = 'TestRefresh123!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.API_PREFIX = '/api';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
process.env.CORS_CREDENTIALS = 'true';

// Load test environment variables (will override above if .env exists)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Set global test timeout (available in beforeAll/afterAll)
// jest.setTimeout(30000); // This should be called in individual tests

// Mock console methods for cleaner test output (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };