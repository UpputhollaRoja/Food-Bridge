-- Migration to add is_onboarded and update profile update logic

-- 1. Add is_onboarded column to profiles (the actual table used for users)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_onboarded boolean NOT NULL DEFAULT false;

-- 2. Update the trigger to allow role changes during onboarding
CREATE OR REPLACE FUNCTION public.check_profile_update()
RETURNS trigger AS $$
BEGIN
  -- Allow service_role (auth.uid() is null)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Allow admins to update anything
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' THEN
    RETURN NEW;
  END IF;

  -- Block regular users from changing their role, EXCEPT during onboarding
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF OLD.is_onboarded = false THEN
      -- User is onboarding, allow role change
      -- Note: NO exception raised here.
    ELSE
      RAISE EXCEPTION 'Unauthorized: Only admins can change roles.';
    END IF;
  END IF;
  
  -- Prevent regular users from changing verification status
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can change verification status.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
