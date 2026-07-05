import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { getOpenAIClient } from '../../lib/openai'
import { requireAuth } from '../../middleware/auth'

const router = Router()

// Zod schema — validates the OpenAI response shape before use
const ImpactReportSchema = z.object({
  headline: z.string().max(120),
  summary: z.string().max(600),
})

// ──────────────────────────────────────────────
// Deterministic fallback templates (PRD Section 6.4)
// ──────────────────────────────────────────────
function deterministicReport(
  totalKg: number,
  totalMeals: number,
  co2Kg: number,
  role: string
): { headline: string; summary: string } {
  const headline = 'Making a Measurable Difference'
  let summary: string

  switch (role) {
    case 'donor':
      summary = `Through your surplus listings, you recovered ${totalKg} kg of food, supplying an estimated ${totalMeals} meals to local NGOs and preventing ${co2Kg.toFixed(1)} kg CO₂e of greenhouse emissions.`
      break
    case 'ngo':
      summary = `By claiming and distributing surplus food, your organisation rescued ${totalKg} kg of edible resources, serving ~${totalMeals} meals and preventing ${co2Kg.toFixed(1)} kg CO₂e of carbon emissions.`
      break
    default:
      summary = `Together, our platform redirected ${totalKg} kg of food surplus to feed ${totalMeals} beneficiaries, offsetting ${co2Kg.toFixed(1)} kg CO₂e from entering the atmosphere.`
  }

  return { headline, summary }
}

// POST /api/ai/impact-report
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { totalKg = 0, totalMeals = 0, activeUsers = 0, role = 'general' } = req.body

    // PRD Section 6.4: strict conversion factor — 2.5 kg CO2e per 1 kg food waste avoided
    const co2Kg = totalKg * 2.5

    // Try OpenAI first
    const openai = getOpenAIClient()
    if (openai) {
      try {
        const prompt = `You are a copywriter for a food waste redistribution platform. Write a brief narrative impact report (2–4 sentences) and a short headline for a ${role} dashboard.

Platform stats:
- Meals Distributed: ${totalMeals}
- Food Waste Avoided: ${totalKg} kg
- CO₂ Emissions Avoided: ${co2Kg.toFixed(1)} kg CO₂e (conversion: 2.5 kg CO₂e per kg food)
- Active Members: ${activeUsers}

Keep it inspiring and professional. Return ONLY a JSON object: { "headline": string, "summary": string }`

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        })

        const raw = JSON.parse(completion.choices[0].message.content || '{}')
        const parsed = ImpactReportSchema.safeParse(raw)

        if (parsed.success) {
          res.json({ ...parsed.data, co2AvoidedKg: Math.round(co2Kg), source: 'openai' })
          return
        }
        console.warn('OpenAI impact-report returned invalid shape, using fallback:', raw)
      } catch (aiErr) {
        console.error('OpenAI impact-report call failed, using fallback:', aiErr)
      }
    }

    // Deterministic fallback
    const report = deterministicReport(totalKg, totalMeals, co2Kg, role)
    res.json({ ...report, co2AvoidedKg: Math.round(co2Kg), source: 'fallback' })
  } catch (err: any) {
    console.error('/api/ai/impact-report error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
