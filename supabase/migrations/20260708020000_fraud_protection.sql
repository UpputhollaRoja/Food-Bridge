-- Alter profiles verification_status check constraint to include 'suspended'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_verification_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_verification_status_check
  CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended'));

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to insert reports" ON public.reports;
DROP POLICY IF EXISTS "Allow admins to select reports" ON public.reports;
DROP POLICY IF EXISTS "Allow admins to delete reports" ON public.reports;

-- Policies
CREATE POLICY "Allow authenticated users to insert reports" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Allow admins to select reports" ON public.reports
  FOR SELECT TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Allow admins to delete reports" ON public.reports
  FOR DELETE TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
