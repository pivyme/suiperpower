import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// @ts-ignore - Prisma 7 config options
export default defineConfig({
  earlyAccess: true,
  schema: './schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
