import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { createUserClient } from '../../lib/supabase'
import { getOpenAIClient } from '../../lib/openai'
import { requireAuth } from '../../middleware/auth'

const router = Router()

// Zod schema — validates the OpenAI response shape before use
const PrioritizeResponseSchema = z.object({
  priority_score: z.number().min(0).max(100),
  reasoning: z.string(),
})

// ──────────────────────────────────────────────
// Deterministic fallback (PRD Section 6.4)
// Called when OpenAI is unavailable or returns invalid data.
// ──────────────────────────────────────────────
function deterministicPriority(donation: any): { priority_score: number; reasoning: string } {
  const now = Date.now()
  const expiryMs = new Date(donation.expiry_at).getTime()
  const hoursLeft = Math.max(0, (expiryMs - now) / (1000 * 60 * 60))

  // Time urgency: 0 hrs → 70 pts, 24 hrs → 0 pts (capped at 70)
  const timeScore = Math.min(70, Math.max(0, 70 - (hoursLeft / 24) * 70))

  // Volume score: each meal counts up to 30 pts (capped at 30 for 100+ meals)
  const mealScore = Math.min(30, (donation.estimated_meals || 0) / 100 * 30)

  const priority_score = Math.round(timeScore + mealScore)
  const reasoning = `Deterministic fallback — ${hoursLeft.toFixed(1)} hrs until expiry (time score: ${timeScore.toFixed(0)}), estimated ${donation.estimated_meals || 0} meals (volume score: ${mealScore.toFixed(0)}).`

  return { priority_score, reasoning }
}

// POST /api/ai/prioritize
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { donationId } = req.body
    if (!donationId) {
      res.status(400).json({ error: 'donationId is required.' })
      return
    }

    const token = req.headers.authorization!.slice(7)
    const client = createUserClient(token)

    const { data: donation, error } = await client
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .single()

    if (error || !donation) {
      res.status(404).json({ error: 'Donation not found.' })
      return
    }

    // Try OpenAI first
    const openai = getOpenAIClient()
    if (openai) {
      try {
        const prompt = `You are a food waste expert prioritizing food surplus donations for redistribution.
Donation details:
- Title: ${donation.title}
- Category: ${donation.category}
- Quantity: ${donation.quantity} ${donation.quantity_unit}
- Estimated Meals: ${donation.estimated_meals}
- Expiry Time: ${donation.expiry_at}
- Pickup Window: ${donation.pickup_window_start} to ${donation.pickup_window_end}
- Storage Instructions: ${donation.storage_instructions || 'None'}
- Allergens: ${donation.allergen_info || 'None'}

Return ONLY a JSON object with keys "priority_score" (0-100) and "reasoning" (short explanation).`

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        })

        const raw = JSON.parse(completion.choices[0].message.content || '{}')
        const parsed = PrioritizeResponseSchema.safeParse(raw)

        if (parsed.success) {
          res.json({ ...parsed.data, source: 'openai' })
          return
        }
        console.warn('OpenAI returned invalid shape, using fallback:', raw)
      } catch (aiErr) {
        console.error('OpenAI call failed, using fallback:', aiErr)
      }
    }

    // Deterministic fallback
    res.json({ ...deterministicPriority(donation), source: 'fallback' })
  } catch (err: any) {
    console.error('/api/ai/prioritize error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
