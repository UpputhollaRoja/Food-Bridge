// Load env first — reads from the frontend's .env.local
import './config/env'

import express from 'express'
import cors from 'cors'
import { ENV } from './config/env'

// AI route handlers
import prioritizeRouter from './routes/ai/prioritize'
import matchRouter from './routes/ai/match'
import impactReportRouter from './routes/ai/impact-report'

const app = express()

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────

// Allow requests from the Next.js frontend
app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }))

// Parse JSON request bodies
app.use(express.json())

// ──────────────────────────────────────────────
// Health check
// ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    supabase: !!ENV.SUPABASE_URL,
    openai: !!ENV.OPENAI_API_KEY,
    timestamp: new Date().toISOString(),
  })
})

// ──────────────────────────────────────────────
// AI Routes  (PRD Sections 4 & 6)
// ──────────────────────────────────────────────
app.use('/api/ai/prioritize', prioritizeRouter)
app.use('/api/ai/match', matchRouter)
app.use('/api/ai/impact-report', impactReportRouter)

// ──────────────────────────────────────────────
// 404 catch-all
// ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' })
})

// ──────────────────────────────────────────────
// Start server
// ──────────────────────────────────────────────
app.listen(ENV.PORT, () => {
  console.log(`✅  Food Bridge backend running on http://localhost:${ENV.PORT}`)
  console.log(`   Supabase URL : ${ENV.SUPABASE_URL}`)
  console.log(`   OpenAI       : ${ENV.OPENAI_API_KEY ? 'configured' : 'NOT SET — using deterministic fallback'}`)
  console.log(`   Frontend URL : ${ENV.FRONTEND_URL}`)
})

export default app
