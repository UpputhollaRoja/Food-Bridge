-- Phase D: AI Rate Limits

CREATE TABLE IF NOT EXISTS public.rate_limits (
  route TEXT PRIMARY KEY,
  tokens_used INT DEFAULT 0,
  requests_count INT DEFAULT 0,
  reset_at TIMESTAMP WITH TIME ZONE
);
