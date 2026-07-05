import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { createUserClient } from '../../lib/supabase'
import { getOpenAIClient } from '../../lib/openai'
import { requireAuth } from '../../middleware/auth'

const router = Router()

// Zod schema — validates the OpenAI response shape before use
const MatchResponseSchema = z.object({
  matches: z.array(
    z.object({
      ngo_id: z.string(),
      rank: z.number().int().positive(),
      fit_score: z.number().min(0).max(100),
      match_reason: z.string(),
    })
  ),
})

// ──────────────────────────────────────────────
// Haversine distance calculation
// ──────────────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ──────────────────────────────────────────────
// Deterministic fallback (PRD Section 6.4)
// ──────────────────────────────────────────────
function deterministicMatch(donation: any, candidates: any[]) {
  return candidates
    .map((c) => {
      // Deduct 2 pts per km of distance
      let fit_score = Math.max(0, 100 - c.distanceKm * 2)
      // Bonus if NGO preference categories include this donation category
      const prefCategories: string[] = c.preferences?.categories || []
      if (prefCategories.includes(donation.category)) fit_score = Math.min(100, fit_score + 20)
      return {
        ngo_id: c.id,
        fit_score: Math.round(fit_score),
        match_reason: `${c.distanceKm.toFixed(1)} km away.${prefCategories.includes(donation.category) ? ' Category preference match.' : ''} (Deterministic fallback.)`,
      }
    })
    .sort((a, b) => b.fit_score - a.fit_score)
    .map((item, idx) => ({ ...item, rank: idx + 1 }))
}

// POST /api/ai/match
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { donationId } = req.body
    if (!donationId) {
      res.status(400).json({ error: 'donationId is required.' })
      return
    }

    const token = req.headers.authorization!.slice(7)
    const client = createUserClient(token)

    // Fetch donation
    const { data: donation, error: donErr } = await client
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .single()

    if (donErr || !donation) {
      res.status(404).json({ error: 'Donation not found.' })
      return
    }

    // Fetch verified NGOs
    const { data: ngos, error: ngoErr } = await client
      .from('profiles')
      .select('id, full_name, organization_name, address, latitude, longitude, preferences')
      .eq('role', 'ngo')
      .eq('verification_status', 'verified')

    if (ngoErr || !ngos || ngos.length === 0) {
      res.json({ matches: [], source: 'fallback' })
      return
    }

    // Build candidate list with pre-calculated distances
    const candidates = ngos.map((ngo) => ({
      id: ngo.id,
      name: ngo.organization_name || ngo.full_name,
      address: ngo.address,
      preferences: ngo.preferences || {},
      distanceKm: haversineKm(
        parseFloat(donation.pickup_latitude),
        parseFloat(donation.pickup_longitude),
        parseFloat(ngo.latitude || '0'),
        parseFloat(ngo.longitude || '0')
      ),
    }))

    // Try OpenAI first
    const openai = getOpenAIClient()
    if (openai) {
      try {
        const prompt = `You are coordinating food waste logistics. Rank these NGOs as recipients for a food donation.

Donation:
- Title: ${donation.title}
- Category: ${donation.category}
- Expiry: ${donation.expiry_at}
- Quantity: ${donation.quantity} ${donation.quantity_unit}

NGO Candidates:
${candidates.map((c, i) => `${i + 1}. [ID: ${c.id}] ${c.name} | ${c.distanceKm.toFixed(1)} km | Preferences: ${JSON.stringify(c.preferences)}`).join('\n')}

Return ONLY a JSON object: { "matches": [ { "ngo_id": string, "rank": number, "fit_score": number (0-100), "match_reason": string } ] }`

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        })

        const raw = JSON.parse(completion.choices[0].message.content || '{}')
        const parsed = MatchResponseSchema.safeParse(raw)

        if (parsed.success) {
          // Enrich matches with NGO display info
          const ngoMap = new Map(candidates.map((c) => [c.id, c]))
          const enriched = parsed.data.matches.map((m) => ({
            ...m,
            organization_name: ngoMap.get(m.ngo_id)?.name ?? 'Unknown',
            distance_km: ngoMap.get(m.ngo_id)?.distanceKm ?? 0,
          }))
          res.json({ matches: enriched, source: 'openai' })
          return
        }
        console.warn('OpenAI match response invalid shape, using fallback:', raw)
      } catch (aiErr) {
        console.error('OpenAI match call failed, using fallback:', aiErr)
      }
    }

    // Deterministic fallback
    const fallbackMatches = deterministicMatch(donation, candidates).map((m) => ({
      ...m,
      organization_name: candidates.find((c) => c.id === m.ngo_id)?.name ?? 'Unknown',
      distance_km: candidates.find((c) => c.id === m.ngo_id)?.distanceKm ?? 0,
    }))
    res.json({ matches: fallbackMatches, source: 'fallback' })
  } catch (err: any) {
    console.error('/api/ai/match error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
