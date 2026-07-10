const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) {
  console.log("No service role key");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const timestamp = Date.now();
  
  // 1. Create Donor
  const donorRes = await supabase.auth.admin.createUser({ email: 'donor_' + timestamp + '@test.com', password: 'password123', email_confirm: true, user_metadata: { role: 'donor', full_name: 'Test Donor' }});
  const donorId = donorRes.data.user.id;
  await supabase.from('profiles').update({ role: 'donor', full_name: 'Test Donor', verification_status: 'verified', latitude: 37.7749, longitude: -122.4194, address: 'Donor Address' }).eq('id', donorId);
  
  // 2. Create NGO
  const ngoRes = await supabase.auth.admin.createUser({ email: 'ngo_' + timestamp + '@test.com', password: 'password123', email_confirm: true, user_metadata: { role: 'ngo', full_name: 'Test NGO' }});
  const ngoId = ngoRes.data.user.id;
  await supabase.from('profiles').update({ role: 'ngo', full_name: 'Test NGO', verification_status: 'verified', latitude: 37.7849, longitude: -122.4094, address: 'NGO Address' }).eq('id', ngoId);
  
  // 3. Create Volunteer
  const volRes = await supabase.auth.admin.createUser({ email: 'vol_' + timestamp + '@test.com', password: 'password123', email_confirm: true, user_metadata: { role: 'volunteer', full_name: 'Test Volunteer' }});
  const volId = volRes.data.user.id;
  await supabase.from('profiles').update({ role: 'volunteer', full_name: 'Test Volunteer', verification_status: 'verified', latitude: 37.7799, longitude: -122.4144, phone: '555-1234' }).eq('id', volId);

  // 4. Create Donation
  const don = await supabase.from('donations').insert({
    donor_id: donorId,
    title: 'Test Tracking Donation',
    description: 'Food for tracking test',
    quantity: 10,
    quantity_unit: 'kg',
    food_category: 'produce',
    expiry_at: new Date(Date.now() + 86400000).toISOString(),
    pickup_location: 'Donor Address',
    pickup_latitude: 37.7749,
    pickup_longitude: -122.4194,
    status: 'assigned'
  }).select().single();
  
  const donationId = don.data.id;

  // 5. Create Claim
  const claim = await supabase.from('claims').insert({
    donation_id: donationId,
    ngo_id: ngoId,
    status: 'assigned'
  }).select().single();

  const claimId = claim.data.id;

  // 6. Create Delivery
  const del = await supabase.from('deliveries').insert({
    claim_id: claimId,
    volunteer_id: volId,
    status: 'assigned'
  }).select().single();

  console.log("DONOR:", 'donor_' + timestamp + '@test.com');
  console.log("NGO:", 'ngo_' + timestamp + '@test.com');
  console.log("VOLUNTEER:", 'vol_' + timestamp + '@test.com');
  console.log("Delivery ID:", del.data.id);
}

main();
