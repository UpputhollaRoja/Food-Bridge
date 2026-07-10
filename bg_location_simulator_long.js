const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
let lat = 37.7749;
let lng = -122.4194;
setInterval(async () => {
  lat += 0.0005;
  lng += 0.0005;
  await supabase.from('delivery_locations').insert({
    delivery_id: '2d1623a8-43c9-4671-a39d-52388fba7b34',
    latitude: lat,
    longitude: lng
  });
  console.log("Inserted location", lat, lng);
}, 4000);
