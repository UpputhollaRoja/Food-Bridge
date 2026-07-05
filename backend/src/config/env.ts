import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from the frontend's .env.local file.
// process.cwd() is the backend/ folder when running `npm run dev`,
// so `../` goes up one level to the project root where .env.local lives.
// This works correctly under both ts-node-dev and compiled Node.js.
dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') })

export const ENV = {
  // Supabase — sourced from frontend .env.local
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // OpenAI — server-side only, never exposed to browser
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

  // Server config
  PORT: parseInt(process.env.BACKEND_PORT || '4000', 10),
  FRONTEND_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
}

// Validate required vars on startup
const REQUIRED = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const
for (const key of REQUIRED) {
  if (!ENV[key]) {
    console.error(`❌  Missing required env var: ${key}. Check the frontend .env.local file.`)
    process.exit(1)
  }
}
