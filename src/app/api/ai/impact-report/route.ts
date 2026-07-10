import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { z } from 'zod'

let openai: OpenAI | null = null

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

const impactResponseSchema = z.object({
  summary: z.string(),
  headline: z.string(),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { totalMeals, totalKg, activeUsers, role } = await req.json()

    // Calculate CO2 avoided using strict PRD conversion factor: 2.5 kg CO2e per 1 kg food waste avoided
    const co2AvoidedKg = (totalKg || 0) * 2.5

    let summary = ''
    let headline = ''

    const openaiClient = getOpenAIClient()
    if (openaiClient) {
      try {
        const prompt = `You are a copywriter for a food waste platform. Write a brief narrative impact report (2-4 sentences) and a short headline summarizing these achievements for a ${role || 'user'} dashboard:
- Estimated Meals Distributed: ${totalMeals || 0} meals
- Total Food Waste Avoided: ${totalKg || 0} kg
- Calculated CO2 Emission Avoided: ${co2AvoidedKg.toFixed(1)} kg CO2e (using factor 2.5)
- Active community members: ${activeUsers || 0} users

Keep it inspiring, professional, and focus on the environmental and social impact. Return ONLY a JSON object containing keys "headline" and "summary".`

        const response = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        })

        const content = response.choices[0].message.content
        if (content) {
          const parsed = impactResponseSchema.parse(JSON.parse(content))
          summary = parsed.summary
          headline = parsed.headline
        }
      } catch (aiErr) {
        console.error('OpenAI impact report failed, using fallback template:', aiErr)
        const fallback = generateFallbackReport(totalMeals, totalKg, co2AvoidedKg, role)
        summary = fallback.summary
        headline = fallback.headline
      }
    } else {
      const fallback = generateFallbackReport(totalMeals, totalKg, co2AvoidedKg, role)
      summary = fallback.summary
      headline = fallback.headline
    }

    return NextResponse.json({ 
      headline, 
      summary, 
      co2AvoidedKg: Math.round(co2AvoidedKg) 
    })

  } catch (err: any) {
    console.error('Route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function generateFallbackReport(meals: number, kg: number, co2: number, role: string) {
  const headline = 'Making a Measurable Difference'
  let summary = ''

  if (role === 'donor') {
    summary = `Through your surplus listings, you successfully recovered ${kg} kg of food waste, supplying an estimated ${meals} meals to local NGOs and preventing ${co2.toFixed(1)} kg of CO2e greenhouse emissions.`
  } else if (role === 'ngo') {
    summary = `By claiming and distributing surplus food, your organization rescued ${kg} kg of edible resources, serving ~${meals} meals and preventing ${co2.toFixed(1)} kg of carbon emissions.`
  } else {
    summary = `Together, our platform has redirected ${kg} kg of food surplus to feed ${meals} hungry beneficiaries, offsetting ${co2.toFixed(1)} kg of CO2 emissions from entering our atmosphere.`
  }

  return { headline, summary }
}
