import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

// Extend the Express Request type to carry the verified user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email?: string
        role?: string
      }
    }
  }
}

/**
 * requireAuth middleware
 * Extracts the Bearer JWT from the Authorization header,
 * verifies it against Supabase Auth, and attaches the user
 * to req.user. Returns 401 if missing or invalid.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header.' })
    return
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired token.' })
    return
  }

  // Attach minimal user info for downstream handlers
  req.user = { id: user.id, email: user.email ?? undefined }
  next()
}

/**
 * requireRole middleware factory
 * Must be used after requireAuth. Checks the profile role
 * from the profiles table and blocks access if the user's
 * role is not in the allowed list.
 */
export function requireRole(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthenticated.' })
      return
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single()

    if (error || !profile) {
      res.status(403).json({ error: 'Could not resolve user role.' })
      return
    }

    if (!allowedRoles.includes(profile.role)) {
      res.status(403).json({ error: `Access denied. Required role(s): ${allowedRoles.join(', ')}.` })
      return
    }

    req.user.role = profile.role
    next()
  }
}
