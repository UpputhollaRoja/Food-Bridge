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

const matchResponseSchema = z.object({
  matches: z.array(
    z.object({
      ngo_id: z.string(),
      rank: z.number(),
      fit_score: z.number().min(0).max(100),
      match_reason: z.string(),
    })
  ),
})

export async function POST(req: Request) {
  try {
    const { donationId } = await req.json()
    if (!donationId) {
      return NextResponse.json({ error: 'donationId is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Fetch donation details
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .single()

    if (donationError || !donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
    }

    // 2. Fetch all verified NGOs
    const { data: ngos, error: ngoError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'ngo')
      .eq('verification_status', 'verified')

    if (ngoError || !ngos || ngos.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    // 3. Compute distances for candidate list
    const candidates = ngos.map((ngo) => {
      const distance = calculateDistance(
        parseFloat(donation.pickup_latitude),
        parseFloat(donation.pickup_longitude),
        parseFloat(ngo.latitude || '0'),
        parseFloat(ngo.longitude || '0')
      )
      return {
        id: ngo.id,
        name: ngo.organization_name || ngo.full_name,
        address: ngo.address,
        preferences: ngo.preferences || {},
        distanceKm: distance,
      }
    })

    let rankedMatches: any[] = []

    const openaiClient = getOpenAIClient()
    if (openaiClient) {
      try {
        const prompt = `You are an AI coordinating food waste logistics. Rank the following candidate NGOs for this food donation.
Donation details:
- Title: ${donation.title}
- Category: ${donation.category}
- Expiry: ${donation.expiry_at}
- Quantity: ${donation.quantity} ${donation.quantity_unit}

NGO Candidates:
${candidates.map((c, i) => `${i + 1}. [ID: ${c.id}] Name: ${c.name}, Distance: ${c.distanceKm.toFixed(1)} km, Preferences: ${JSON.stringify(c.preferences)}`).join('\n')}

Rank these candidate NGOs from best match to worst match based on proximity, speed/urgency fit, and food type preferences.
Return ONLY a JSON object containing a "matches" key which is an array of objects: { "ngo_id": string, "rank": number, "fit_score": number, "match_reason": string }`

        const response = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        })

        const content = response.choices[0].message.content
        if (content) {
          const parsed = matchResponseSchema.parse(JSON.parse(content))
          rankedMatches = parsed.matches
        }
      } catch (aiErr) {
        console.error('OpenAI matching failed, falling back to deterministic sorting:', aiErr)
        rankedMatches = calculateDeterministicMatching(donation, candidates)
      }
    } else {
      rankedMatches = calculateDeterministicMatching(donation, candidates)
    }

    // Enhance matches with NGO names/orgs
    const ngoNamesMap = new Map(candidates.map((c) => [c.id, c]))
    const enhancedMatches = rankedMatches.map((match) => {
      const details = ngoNamesMap.get(match.ngo_id)
      return {
        ...match,
        organization_name: details?.name || 'NGO Partner',
        address: details?.address || 'Unknown address',
        distance_km: details?.distanceKm || 0,
      }
    })

    return NextResponse.json({ matches: enhancedMatches })

  } catch (err: any) {
    console.error('Route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function calculateDeterministicMatching(donation: any, candidates: any[]) {
  const scored = candidates.map((c) => {
    let fitScore = 100 - c.distanceKm * 2 // deduct points for distance
    
    // category preference match bonus
    const prefCategories = c.preferences?.categories || []
    if (prefCategories.includes(donation.category)) {
      fitScore += 20
    }

    fitScore = Math.max(0, Math.min(100, fitScore))

    return {
      ngo_id: c.id,
      fit_score: fitScore,
      match_reason: `Located ${c.distanceKm.toFixed(1)} km away. ${
        prefCategories.includes(donation.category)
          ? 'Matches NGO category preferences.'
          : 'Fits general distribution availability.'
      } (Calculated via fallback logic).`,
    }
  })

  // Sort and assign rank
  return scored
    .sort((a, b) => b.fit_score - a.fit_score)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }))
}
