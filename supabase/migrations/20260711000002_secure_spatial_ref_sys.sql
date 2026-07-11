-- Revoke permissions on spatial_ref_sys to prevent it from being exposed via the Data API
REVOKE ALL ON TABLE public.spatial_ref_sys FROM anon, authenticated;
