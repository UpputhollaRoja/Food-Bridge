-- Migration: Initial Database Schema Setup
-- Drops existing empty tables that conflict with the PRD specification
DROP VIEW IF EXISTS public.admin_stats CASCADE;
DROP VIEW IF EXISTS public.volunteer_stats CASCADE;
DROP VIEW IF EXISTS public.ngo_stats CASCADE;
DROP VIEW IF EXISTS public.donor_stats CASCADE;
DROP VIEW IF EXISTS public.impact_metrics CASCADE;

DROP TABLE IF EXISTS public.deliveries CASCADE;
DROP TABLE IF EXISTS public.claims CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create Profiles Table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('donor', 'ngo', 'volunteer', 'admin')),
  full_name text NOT NULL,
  organization_name text,
  phone text,
  address text,
  latitude numeric,
  longitude numeric,
  verification_status text NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_documents text[], -- array of storage paths
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create Donations Table
CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('cooked_meals', 'bakery', 'produce', 'packaged', 'dairy', 'beverages', 'other')),
  quantity numeric NOT NULL,
  quantity_unit text NOT NULL,
  estimated_meals integer NOT NULL,
  expiry_at timestamptz NOT NULL,
  pickup_location text NOT NULL,
  pickup_latitude numeric NOT NULL,
  pickup_longitude numeric NOT NULL,
  pickup_window_start timestamptz NOT NULL,
  pickup_window_end timestamptz NOT NULL,
  storage_instructions text,
  allergen_info text,
  images text[], -- array of storage paths
  status text NOT NULL CHECK (status IN ('available', 'reserved', 'pickup_scheduled', 'collected', 'delivered', 'completed', 'expired', 'cancelled')),
  priority_score numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create Claims Table
CREATE TABLE public.claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  ngo_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  claimed_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create Deliveries Table
CREATE TABLE public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  volunteer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('unassigned', 'assigned', 'pickup_completed', 'in_transit', 'delivered', 'confirmed')),
  pickup_confirmed_at timestamptz,
  delivered_at timestamptz,
  proof_image_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create Notifications Table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- RLS POLICIES
-- ----------------------------------------------------

-- Profiles Policies
CREATE POLICY "Allow authenticated read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users and admins to update profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (
    auth.uid() = id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Allow users and admins to insert profiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Helper functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.check_donation_donor(p_donation_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.donations
    WHERE id = p_donation_id AND donor_id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_claim_ngo(p_donation_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.claims
    WHERE donation_id = p_donation_id AND ngo_id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Donations Policies
CREATE POLICY "Donors can CRUD own donations" ON public.donations
  FOR ALL TO authenticated USING (donor_id = auth.uid());

CREATE POLICY "NGOs and admins can view available donations" ON public.donations
  FOR SELECT TO authenticated USING (
    status = 'available' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('ngo', 'admin')
  );

CREATE POLICY "NGOs can view claimed donations" ON public.donations
  FOR SELECT TO authenticated USING (
    public.check_claim_ngo(id, auth.uid())
  );

CREATE POLICY "Volunteers can view donations" ON public.donations
  FOR SELECT TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'volunteer'
  );

-- Claims Policies
CREATE POLICY "NGOs can manage own claims" ON public.claims
  FOR ALL TO authenticated USING (ngo_id = auth.uid());

CREATE POLICY "Donors can read claims for their donations" ON public.claims
  FOR SELECT TO authenticated USING (
    public.check_donation_donor(donation_id, auth.uid())
  );

CREATE POLICY "Admins can manage all claims" ON public.claims
  FOR ALL TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Deliveries Policies
CREATE POLICY "Volunteers can read assigned or unassigned deliveries" ON public.deliveries
  FOR SELECT TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'volunteer' AND
    (volunteer_id IS NULL OR volunteer_id = auth.uid())
  );

CREATE POLICY "Volunteers can update own deliveries" ON public.deliveries
  FOR UPDATE TO authenticated USING (
    volunteer_id = auth.uid()
  );

CREATE POLICY "Donors and NGOs can read deliveries related to their claims" ON public.deliveries
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.claims c
      JOIN public.donations d ON d.id = c.donation_id
      WHERE c.id = claim_id AND (c.ngo_id = auth.uid() OR d.donor_id = auth.uid())
    )
  );

CREATE POLICY "Admins have full access to deliveries" ON public.deliveries
  FOR ALL TO authenticated USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Notifications Policies
CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- ----------------------------------------------------
-- PROCEDURES & RPCs
-- ----------------------------------------------------

-- Atomic claim donation RPC
CREATE OR REPLACE FUNCTION public.claim_donation(p_donation_id uuid, p_ngo_id uuid)
RETURNS uuid AS $$
DECLARE
  v_claim_id uuid;
  v_status text;
  v_verification text;
BEGIN
  -- Check if caller is authorized (must be the NGO themselves or an admin)
  IF p_ngo_id != auth.uid() AND COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), '') != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: You can only claim donations on behalf of your own NGO';
  END IF;

  -- Check if NGO is verified
  SELECT verification_status INTO v_verification FROM public.profiles WHERE id = p_ngo_id;
  IF v_verification IS NULL OR v_verification != 'verified' THEN
    RAISE EXCEPTION 'Your organization must be verified by an admin before you can claim donations.';
  END IF;

  -- Select status for update (lock the row)
  SELECT status INTO v_status FROM public.donations WHERE id = p_donation_id FOR UPDATE;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Donation not found';
  END IF;

  IF v_status != 'available' THEN
    RAISE EXCEPTION 'Donation is already claimed or unavailable';
  END IF;

  -- Update donation status
  UPDATE public.donations
  SET status = 'reserved', updated_at = now()
  WHERE id = p_donation_id;

  -- Insert claim record
  INSERT INTO public.claims (donation_id, ngo_id, status, claimed_at)
  VALUES (p_donation_id, p_ngo_id, 'pending', now())
  RETURNING id INTO v_claim_id;

  -- Create corresponding unassigned delivery
  INSERT INTO public.deliveries (claim_id, status)
  VALUES (v_claim_id, 'unassigned');

  RETURN v_claim_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic assign delivery RPC
CREATE OR REPLACE FUNCTION public.assign_delivery(p_delivery_id uuid, p_volunteer_id uuid)
RETURNS void AS $$
DECLARE
  v_status text;
  v_volunteer_role text;
  v_claim_id uuid;
  v_donation_id uuid;
BEGIN
  -- Check if caller is authorized (must be the volunteer themselves or an admin)
  IF p_volunteer_id != auth.uid() AND COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), '') != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: You can only assign deliveries to yourself';
  END IF;

  -- Verify user is a volunteer
  SELECT role INTO v_volunteer_role FROM public.profiles WHERE id = p_volunteer_id;
  IF v_volunteer_role != 'volunteer' THEN
    RAISE EXCEPTION 'User must be a volunteer to accept deliveries';
  END IF;

  -- Select and lock delivery row
  SELECT status, claim_id INTO v_status, v_claim_id FROM public.deliveries WHERE id = p_delivery_id FOR UPDATE;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Delivery not found';
  END IF;

  IF v_status != 'unassigned' THEN
    RAISE EXCEPTION 'Delivery has already been assigned or completed';
  END IF;

  -- Get donation_id from claim
  SELECT donation_id INTO v_donation_id FROM public.claims WHERE id = v_claim_id;

  -- Update delivery status and assign volunteer
  UPDATE public.deliveries
  SET volunteer_id = p_volunteer_id, status = 'assigned', created_at = now()
  WHERE id = p_delivery_id;

  -- Update donation status to 'pickup_scheduled'
  UPDATE public.donations
  SET status = 'pickup_scheduled', updated_at = now()
  WHERE id = v_donation_id;

  -- Update claim status to 'confirmed'
  UPDATE public.claims
  SET status = 'confirmed'
  WHERE id = v_claim_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------
-- TRIGGERS FOR NOTIFICATIONS & ONBOARDING
-- ----------------------------------------------------

-- Profile creation trigger on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role text;
  v_full_name text;
  v_status text;
BEGIN
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'donor');
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', 'New User');
  
  IF v_role IN ('donor', 'ngo') THEN
    v_status := 'pending';
  ELSE
    v_status := 'verified';
  END IF;

  INSERT INTO public.profiles (id, role, full_name, verification_status, created_at, updated_at)
  VALUES (new.id, v_role, v_full_name, v_status, now(), now());
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Notification trigger on donation status update
CREATE OR REPLACE FUNCTION public.handle_donation_notification()
RETURNS trigger AS $$
BEGIN
  -- When donation is claimed (status changes from available to reserved)
  IF (OLD.status = 'available' AND NEW.status = 'reserved') THEN
    INSERT INTO public.notifications (user_id, type, payload)
    SELECT 
      NEW.donor_id,
      'donation_claimed',
      json_build_object(
        'donation_id', NEW.id,
        'donation_title', NEW.title,
        'ngo_id', c.ngo_id,
        'message', 'Your donation "' || NEW.title || '" has been claimed!'
      )
    FROM public.claims c
    WHERE c.donation_id = NEW.id AND c.status = 'pending'
    LIMIT 1;
  END IF;

  -- When donation status changes to pickup_scheduled
  IF (OLD.status != 'pickup_scheduled' AND NEW.status = 'pickup_scheduled') THEN
    -- Notify donor
    INSERT INTO public.notifications (user_id, type, payload)
    VALUES (
      NEW.donor_id,
      'pickup_scheduled',
      json_build_object(
        'donation_id', NEW.id,
        'donation_title', NEW.title,
        'message', 'A volunteer has scheduled the pickup for "' || NEW.title || '".'
      )
    );
    
    -- Notify NGO
    INSERT INTO public.notifications (user_id, type, payload)
    SELECT
      c.ngo_id,
      'pickup_scheduled',
      json_build_object(
        'donation_id', NEW.id,
        'donation_title', NEW.title,
        'message', 'A volunteer has accepted the delivery and scheduled pickup for "' || NEW.title || '".'
      )
    FROM public.claims c
    WHERE c.donation_id = NEW.id
    LIMIT 1;
  END IF;

  -- When status changes to collected
  IF (OLD.status != 'collected' AND NEW.status = 'collected') THEN
    -- Notify NGO
    INSERT INTO public.notifications (user_id, type, payload)
    SELECT
      c.ngo_id,
      'donation_collected',
      json_build_object(
        'donation_id', NEW.id,
        'donation_title', NEW.title,
        'message', 'Your claimed donation "' || NEW.title || '" has been picked up by the volunteer.'
      )
    FROM public.claims c
    WHERE c.donation_id = NEW.id
    LIMIT 1;
  END IF;

  -- When status changes to delivered
  IF (OLD.status != 'delivered' AND NEW.status = 'delivered') THEN
    -- Notify NGO
    INSERT INTO public.notifications (user_id, type, payload)
    SELECT
      c.ngo_id,
      'donation_delivered',
      json_build_object(
        'donation_id', NEW.id,
        'donation_title', NEW.title,
        'message', 'Your donation "' || NEW.title || '" has been delivered. Please confirm receipt.'
      )
    FROM public.claims c
    WHERE c.donation_id = NEW.id
    LIMIT 1;
  END IF;

  -- When status changes to completed
  IF (OLD.status != 'completed' AND NEW.status = 'completed') THEN
    -- Notify Donor
    INSERT INTO public.notifications (user_id, type, payload)
    VALUES (
      NEW.donor_id,
      'donation_completed',
      json_build_object(
        'donation_id', NEW.id,
        'donation_title', NEW.title,
        'message', 'Your donation "' || NEW.title || '" is completed! Thank you!'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_donation_status_changed
  AFTER UPDATE OF status ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.handle_donation_notification();

-- ----------------------------------------------------
-- STATS VIEWS
-- ----------------------------------------------------

-- Donor stats view
CREATE OR REPLACE VIEW public.donor_stats AS
SELECT
  d.donor_id,
  COUNT(d.id) AS total_donations,
  COALESCE(SUM(CASE WHEN d.status = 'completed' THEN d.estimated_meals ELSE 0 END), 0) AS meals_donated,
  COALESCE(SUM(CASE WHEN d.status = 'completed' THEN d.quantity ELSE 0 END), 0) AS waste_prevented_kg
FROM public.donations d
GROUP BY d.donor_id;

-- NGO stats view
CREATE OR REPLACE VIEW public.ngo_stats AS
SELECT
  c.ngo_id,
  COUNT(c.id) AS donations_received,
  COALESCE(SUM(CASE WHEN c.status = 'completed' THEN d.estimated_meals ELSE 0 END), 0) AS beneficiaries_served_est,
  COUNT(CASE WHEN c.status = 'completed' THEN 1 END) AS completed_claims
FROM public.claims c
JOIN public.donations d ON d.id = c.donation_id
GROUP BY c.ngo_id;

-- Volunteer stats view
CREATE OR REPLACE VIEW public.volunteer_stats AS
SELECT
  del.volunteer_id,
  COUNT(del.id) AS deliveries_completed,
  AVG(EXTRACT(EPOCH FROM (del.delivered_at - del.pickup_confirmed_at))/3600) AS avg_delivery_time_hours
FROM public.deliveries del
WHERE del.status IN ('delivered', 'confirmed') AND del.delivered_at IS NOT NULL AND del.pickup_confirmed_at IS NOT NULL
GROUP BY del.volunteer_id;

-- Admin stats view
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) AS active_users,
  COALESCE((SELECT COUNT(*) FROM public.donations WHERE status = 'completed')::numeric / 
    NULLIF((SELECT COUNT(*) FROM public.donations WHERE status NOT IN ('cancelled')), 0) * 100, 0) AS recovery_rate,
  COALESCE((SELECT COUNT(*) FROM public.deliveries WHERE status = 'confirmed')::numeric /
    NULLIF((SELECT COUNT(*) FROM public.deliveries), 0) * 100, 0) AS completion_rate;
