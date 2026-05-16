/**
 * Centralized configuration for the application
 * All commonly used environment variables should be defined here
 */

// Validate required environment variables on startup
const requiredEnvVars: string[] = ['DATABASE_URL', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// App Configuration
export const APP_PORT: number = Number(process.env.APP_PORT) || 4127;
export const NODE_ENV: string = process.env.NODE_ENV || 'development';
export const IS_DEV: boolean = NODE_ENV === 'development';
export const IS_PROD: boolean = NODE_ENV === 'production';

// Database
export const DATABASE_URL: string = process.env.DATABASE_URL as string;

// Authentication
export const JWT_SECRET: string = process.env.JWT_SECRET as string;
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

// Error Log Configuration
export const ERROR_LOG_MAX_RECORDS: number = 10000;
export const ERROR_LOG_CLEANUP_INTERVAL: string = '0 * * * *'; // Every hour

// Sui
export const SUI_NETWORK: string = process.env.SUI_NETWORK || 'testnet';
export const SUI_RPC_URL: string =
  process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io';
export const FAUCET_PACKAGE_ID: string = process.env.FAUCET_PACKAGE_ID || '';
export const FAUCET_OBJECT_ID: string = process.env.FAUCET_OBJECT_ID || '';
export const DUSDC_COIN_TYPE: string = process.env.DUSDC_COIN_TYPE || '';

// Turnstile + rate limits
export const TURNSTILE_SECRET: string = process.env.TURNSTILE_SECRET || '';
export const PER_IP_DAILY_SUI_CAP_MIST: bigint = BigInt(
  process.env.PER_IP_DAILY_SUI_CAP_MIST || '5000000000'
);
export const PER_FP_DAILY_SUI_CAP_MIST: bigint = BigInt(
  process.env.PER_FP_DAILY_SUI_CAP_MIST || '5000000000'
);

// Export all as default object for convenience
export default {
  APP_PORT,
  NODE_ENV,
  IS_DEV,
  IS_PROD,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ERROR_LOG_MAX_RECORDS,
  ERROR_LOG_CLEANUP_INTERVAL,
  SUI_NETWORK,
  SUI_RPC_URL,
  FAUCET_PACKAGE_ID,
  FAUCET_OBJECT_ID,
  DUSDC_COIN_TYPE,
  TURNSTILE_SECRET,
  PER_IP_DAILY_SUI_CAP_MIST,
  PER_FP_DAILY_SUI_CAP_MIST,
};
