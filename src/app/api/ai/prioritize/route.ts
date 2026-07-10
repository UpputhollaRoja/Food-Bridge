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

const prioritizeResponseSchema = z.object({
  priority_score: z.number().min(0).max(100),
  reasoning: z.string(),
})

export async function POST(req: Request) {
  try {
    const { donationId } = await req.json()
    if (!donationId) {
      return NextResponse.json({ error: 'donationId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch donation details
    const { data: donation, error: fetchError } = await supabase
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .single()

    if (fetchError || !donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
    }

    let priorityScore = 0
    let reasoning = ''

    const openaiClient = getOpenAIClient()
    if (openaiClient) {
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

Determine an urgency priority score from 0 (very low priority) to 100 (critical, expires soon, high meal yield, requires refrigeration). Return ONLY a JSON object with keys "priority_score" and "reasoning".`

        const response = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        })

        const content = response.choices[0].message.content
        if (content) {
          const parsed = prioritizeResponseSchema.parse(JSON.parse(content))
          priorityScore = parsed.priority_score
          reasoning = parsed.reasoning
        }
      } catch (aiErr) {
        console.error('OpenAI prioritization failed, falling back to rule-based logic:', aiErr)
        const fallback = calculateDeterministicPriority(donation)
        priorityScore = fallback.score
        reasoning = fallback.reasoning
      }
    } else {
      const fallback = calculateDeterministicPriority(donation)
      priorityScore = fallback.score
      reasoning = fallback.reasoning
    }

    // Update database
    const { error: updateError } = await supabase
      .from('donations')
      .update({ priority_score: priorityScore })
      .eq('id', donationId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, priorityScore, reasoning })

  } catch (err: any) {
    console.error('Route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export function calculateDeterministicPriority(donation: any) {
  const expiry = new Date(donation.expiry_at).getTime()
  const now = Date.now()
  const hoursLeft = (expiry - now) / (1000 * 60 * 60)

  if (hoursLeft <= 0) {
    return { score: 0, reasoning: 'Food has expired (Deterministic Fallback)' }
  }

  let timeScore = 0
  if (hoursLeft <= 6) {
    timeScore = 80 + (6 - hoursLeft) * 3
  } else if (hoursLeft <= 24) {
    timeScore = 50 + (24 - hoursLeft) * 1.5
  } else if (hoursLeft <= 72) {
    timeScore = 20 + (72 - hoursLeft) * 0.6
  } else {
    timeScore = Math.max(5, 20 - (hoursLeft - 72) * 0.1)
  }

  const mealBonus = Math.min(20, (donation.estimated_meals || 0) * 0.2)
  const score = Math.max(0, Math.min(100, timeScore + mealBonus))

  return {
    score,
    reasoning: `Calculated deterministically: ${hoursLeft.toFixed(1)} hours left, serving ~${donation.estimated_meals} meals (OpenAI offline).`
  }
}
