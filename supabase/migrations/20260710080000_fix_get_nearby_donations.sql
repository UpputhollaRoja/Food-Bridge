CREATE OR REPLACE FUNCTION public.get_nearby_donations(
  p_lat  numeric,
  p_lng  numeric,
  p_max_distance_km numeric DEFAULT 100.0
)
RETURNS TABLE (
  id                  uuid,
  donor_id            uuid,
  title               text,
  category            text,
  quantity            numeric,
  quantity_unit       text,
  estimated_meals     integer,
  expiry_at           timestamptz,
  pickup_location     text,
  pickup_latitude     numeric,
  pickup_longitude    numeric,
  pickup_window_start timestamptz,
  pickup_window_end   timestamptz,
  storage_instructions text,
  allergen_info       text,
  images              text[],
  status              text,
  priority_score      numeric,
  created_at          timestamptz,
  updated_at          timestamptz,
  donor_name          text,
  donor_org           text,
  distance_km         numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    d.id,
    d.donor_id,
    d.title,
    d.category,
    d.quantity,
    d.quantity_unit,
    d.estimated_meals,
    d.expiry_at,
    d.pickup_location,
    d.pickup_latitude,
    d.pickup_longitude,
    d.pickup_window_start,
    d.pickup_window_end,
    d.storage_instructions,
    d.allergen_info,
    d.images,
    d.status,
    d.priority_score,
    d.created_at,
    d.updated_at,
    p.full_name        AS donor_name,
    p.organization_name AS donor_org,
    -- Haversine approximation in km
    ROUND(
      (
        6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(p_lat))
            * cos(radians(d.pickup_latitude))
            * cos(radians(d.pickup_longitude) - radians(p_lng))
            + sin(radians(p_lat))
            * sin(radians(d.pickup_latitude))
          ))
        )
      )::numeric, 2
    ) AS distance_km
  FROM public.donations d
  JOIN public.profiles p ON p.id = d.donor_id
  WHERE
    d.status = 'available'
    AND d.expiry_at > now()
    AND (
      p_lat IS NULL 
      OR p_lng IS NULL 
      OR d.pickup_latitude IS NULL 
      OR d.pickup_longitude IS NULL
      OR (
        6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(p_lat))
            * cos(radians(d.pickup_latitude))
            * cos(radians(d.pickup_longitude) - radians(p_lng))
            + sin(radians(p_lat))
            * sin(radians(d.pickup_latitude))
          ))
        )
      ) <= p_max_distance_km
    )
  ORDER BY
    d.priority_score DESC NULLS LAST,
    distance_km ASC NULLS LAST,
    d.expiry_at ASC;
$$;
