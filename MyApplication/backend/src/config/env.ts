import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().default('super_secret_jwt_key_blindhire_2026_sepolia_zk'),
  GROQ_API_KEY: z.string().default('gsk_demo_key_placeholder'),
  SEPOLIA_RPC_URL: z.string().default('https://ethereum-sepolia-rpc.publicnode.com'),
  IPFS_GATEWAY: z.string().default('https://ipfs.io/ipfs/'),
  PINATA_JWT: z.string().optional(),
  PINATA_API_KEY: z.string().optional(),
  PINATA_SECRET_API_KEY: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
