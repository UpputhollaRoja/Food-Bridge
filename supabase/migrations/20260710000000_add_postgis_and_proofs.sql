-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Alter deliveries table to add new columns
ALTER TABLE public.deliveries
ADD COLUMN proof_image_2_url text,
ADD COLUMN failure_reason text;

-- 2. Update the status check constraint on deliveries
-- We need to drop the existing constraint and create a new one.
-- First, find the constraint name. Usually it's `deliveries_status_check`.
ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS deliveries_status_check;

ALTER TABLE public.deliveries
ADD CONSTRAINT deliveries_status_check
CHECK (status IN ('unassigned', 'assigned', 'pickup_completed', 'in_transit', 'delivered', 'confirmed', 'failed', 'failed_by_volunteer'));

-- 3. Create the RPC function for nearby deliveries
-- This function returns deliveries that are unassigned, linked to donations whose pickup location is within the radius.
-- It returns a table with the delivery info and the distance in kilometers.

CREATE OR REPLACE FUNCTION get_nearby_deliveries(
    volunteer_lat double precision,
    volunteer_lng double precision,
    radius_km double precision DEFAULT 15.0
)
RETURNS TABLE (
    delivery_id uuid,
    donation_id uuid,
    donation_title text,
    pickup_address text,
    distance_km double precision,
    created_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id as delivery_id,
        don.id as donation_id,
        don.title as donation_title,
        don.pickup_location as pickup_address,
        (ST_DistanceSphere(
            ST_MakePoint(don.pickup_longitude, don.pickup_latitude),
            ST_MakePoint(volunteer_lng, volunteer_lat)
        ) / 1000.0)::double precision as distance_km,
        d.created_at
    FROM 
        public.deliveries d
    JOIN 
        public.claims c ON d.claim_id = c.id
    JOIN 
        public.donations don ON c.donation_id = don.id
    WHERE 
        d.status = 'unassigned'
        AND ST_DistanceSphere(
            ST_MakePoint(don.pickup_longitude, don.pickup_latitude),
            ST_MakePoint(volunteer_lng, volunteer_lat)
        ) <= (radius_km * 1000.0)
    ORDER BY 
        distance_km ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
