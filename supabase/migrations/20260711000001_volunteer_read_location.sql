-- Migration: Allow volunteers to read their own delivery locations
CREATE POLICY "Volunteers can read own delivery locations" ON public.delivery_locations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.deliveries d
      WHERE d.id = delivery_locations.delivery_id
        AND d.volunteer_id = auth.uid()
    )
  );
