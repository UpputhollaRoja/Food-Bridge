# Implement Live Tracking Map for Donor and NGO

## Current State Analysis
I have reviewed the current codebase:
1. **Donor Dashboard (src/app/dashboard/donor/DonorDashboardClient.tsx)**: The <DeliveryMap> component is **ALREADY PRESENT** and displays for active deliveries (ssigned, pickup_completed, in_transit).
2. **NGO Dashboard (src/app/dashboard/ngo/NgoDashboardClient.tsx)**: The <DeliveryMap> component is **ALREADY PRESENT** and displays under the same conditions.
3. **Map Features (src/components/DeliveryMap.tsx)**: The map currently shows the pickup marker (green), drop-off marker (indigo), and courier marker (purple). It subscribes to Supabase Realtime (delivery_locations table) and animates the volunteer marker without page refreshes.

## Missing Features to Add
The user requested specific, human-readable status texts (e.g., "Volunteer is on the way", "Picked up, heading to drop-off", "Not yet broadcasting"). Currently, the map only shows generic connection statuses like "Live" or "Offline".

## Proposed Changes

### 1. src/components/DeliveryMap.tsx
- Add a new prop: deliveryStatus?: string.
- Update the UI to render the specific requested text:
  - If map is offline: "Not yet broadcasting"
  - If map is live & deliveryStatus === 'assigned': "Volunteer is on the way"
  - If map is live & deliveryStatus === 'pickup_completed' or 'in_transit': "Picked up, heading to drop-off"

### 2. src/app/dashboard/donor/DonorDashboardClient.tsx & src/app/dashboard/ngo/NgoDashboardClient.tsx
- Pass deliveryStatus={delivery.status} into the <DeliveryMap> component.

### 3. src/app/dashboard/volunteer/LogisticsPortalClient.tsx (Volunteer View)
- Also pass deliveryStatus={delivery.status} so the volunteer sees the same clear status text.

## Verification Plan (The 3-Way Test)
Once the code changes are made, I will perform the requested 3-way test:
1. I will programmatically seed a test Donor, NGO, Volunteer, and an active Delivery.
2. I will launch a browser subagent logged in as the Volunteer to start "Live Tracking".
3. I will launch a second browser subagent logged in as the Donor to verify the live map updates in real time.
4. I will launch a third browser subagent logged in as the NGO to verify the live map updates in real time.
5. I will present the video recordings of these tests as proof.
