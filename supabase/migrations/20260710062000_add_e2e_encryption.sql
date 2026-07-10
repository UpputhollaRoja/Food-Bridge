-- Phase B: End-to-End Encryption

-- 1. Add public_key and encrypted_data columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS public_key TEXT,
ADD COLUMN IF NOT EXISTS encrypted_data JSONB;

-- 2. Add encrypted_data to deliveries (for proof metadata)
ALTER TABLE public.deliveries
ADD COLUMN IF NOT EXISTS encrypted_data JSONB;

-- Note: We retain the original phone, address, and verification_documents
-- columns but will stop writing to them in the new client-side flow.
-- We can add a constraint or trigger to nullify them if needed later.
