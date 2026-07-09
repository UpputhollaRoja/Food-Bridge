-- Migration: Add live location tracking for volunteers

CREATE TABLE public.delivery_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.delivery_locations ENABLE ROW LEVEL SECURITY;

-- 1. Volunteer can insert rows only for deliveries where they are the assigned volunteer_id
CREATE POLICY "Volunteers can insert own delivery locations" ON public.delivery_locations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deliveries d
      WHERE d.id = delivery_locations.delivery_id
        AND d.volunteer_id = auth.uid()
    )
  );

-- 2. The donor (via donations -> claims -> deliveries chain) and the claiming NGO can read location rows for that specific delivery
CREATE POLICY "Donors and NGOs can read delivery locations" ON public.delivery_locations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.deliveries del
      JOIN public.claims c ON c.id = del.claim_id
      JOIN public.donations don ON don.id = c.donation_id
      WHERE del.id = delivery_locations.delivery_id
        AND (c.ngo_id = auth.uid() OR don.donor_id = auth.uid())
    )
  );

-- 3. Admin can read all
CREATE POLICY "Admins have full access to delivery locations" ON public.delivery_locations
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Add table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_locations;
