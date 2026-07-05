# Engineering PRD — AI-Powered Food Waste Redistribution Platform
### (Agent-Ready Build Spec for Antigravity IDE)

> This document is written to be handed directly to a coding agent. It converts the
> business-level PRD into concrete data models, routes, components, and build phases
> so the agent can implement without needing to make product decisions.

---

## 0. How to use this document

Build in the phase order given in **Section 11**. Do not skip ahead to AI features
(Section 8) before core CRUD (donations, claims, logistics) works end-to-end.
Each phase lists **Definition of Done** — treat these as acceptance criteria.

---

## 1. Tech Stack (locked)

| Layer | Choice |
|---|---|
| Frontend framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| UI components | ShadCN UI (Radix-based) |
| Auth | Supabase Auth (email/password + email verification) |
| Database | Supabase Postgres |
| File storage | Supabase Storage (food images, delivery proof) |
| AI | OpenAI API (chat completions, function calling / structured output) |
| Hosting | Vercel (app) + Supabase (backend) |
| Forms/validation | React Hook Form + Zod |
| State/data fetching | Supabase JS client + React Server Components; TanStack Query for client-side mutations where needed |

**Environment variables to scaffold in `.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_SITE_URL=
```

---

## 2. Database Schema (Supabase / Postgres)

Use Supabase's `auth.users` as the identity source. All app tables live in `public`
schema and reference `auth.users.id` via `user_id uuid references auth.users(id)`.

### 2.1 `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK, references auth.users(id) | |
| role | text | enum: `donor`, `ngo`, `volunteer`, `admin` |
| full_name | text | |
| organization_name | text | nullable (individuals like volunteers won't have one) |
| phone | text | |
| address | text | |
| latitude | numeric | for proximity matching |
| longitude | numeric | |
| verification_status | text | enum: `pending`, `verified`, `rejected` — required for `donor`/`ngo` |
| verification_documents | text[] | storage paths |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | |

### 2.2 `donations`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | default gen_random_uuid() |
| donor_id | uuid, FK -> profiles.id | |
| title | text | |
| category | text | enum: `cooked_meals`, `bakery`, `produce`, `packaged`, `dairy`, `beverages`, `other` |
| quantity | numeric | |
| quantity_unit | text | e.g. `kg`, `servings`, `boxes` |
| estimated_meals | integer | |
| expiry_at | timestamptz | |
| pickup_location | text | |
| pickup_latitude | numeric | |
| pickup_longitude | numeric | |
| pickup_window_start | timestamptz | |
| pickup_window_end | timestamptz | |
| storage_instructions | text | nullable |
| allergen_info | text | nullable |
| images | text[] | storage paths |
| status | text | enum, see 2.6 |
| priority_score | numeric | nullable, computed by AI (Section 8.1) |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 2.3 `claims`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| donation_id | uuid, FK -> donations.id | |
| ngo_id | uuid, FK -> profiles.id | |
| status | text | enum: `pending`, `confirmed`, `cancelled`, `completed` |
| claimed_at | timestamptz | |
| notes | text | nullable |

### 2.4 `deliveries`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| claim_id | uuid, FK -> claims.id | |
| volunteer_id | uuid, FK -> profiles.id | nullable until assigned |
| status | text | enum: `unassigned`, `assigned`, `pickup_completed`, `in_transit`, `delivered`, `confirmed` |
| pickup_confirmed_at | timestamptz | nullable |
| delivered_at | timestamptz | nullable |
| proof_image_url | text | nullable |
| notes | text | nullable |

### 2.5 `notifications`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK -> profiles.id | |
| type | text | e.g. `donation_created`, `donation_claimed`, `pickup_scheduled`, `delivery_completed`, `expiry_reminder` |
| payload | jsonb | |
| read | boolean | default false |
| created_at | timestamptz | |

### 2.6 Status enums (single source of truth)
```
donation.status: available -> reserved -> pickup_scheduled -> collected -> delivered -> completed
                                                                                     \-> expired / cancelled (from any pre-collected state)
claim.status:    pending -> confirmed -> completed
                        \-> cancelled
delivery.status: unassigned -> assigned -> pickup_completed -> in_transit -> delivered -> confirmed
```

### 2.7 Row Level Security (RLS) — required policies
- `profiles`: user can read/update own row; admin can read/update all.
- `donations`: donor can CRUD own rows; any authenticated `ngo`/`admin` can `select` rows with `status = 'available'`; donor can update status only on own rows.
- `claims`: `ngo` can insert claim for self; donor (via join to donation) and admin can read; ngo can update own claim.
- `deliveries`: `volunteer` can read rows where `volunteer_id = auth.uid()` or `status = 'unassigned'`; can update own assigned rows; admin full access.
- `notifications`: user can read/update (mark read) only own rows.

Write actual SQL migration files under `supabase/migrations/`. Use Supabase CLI conventions (`YYYYMMDDHHMMSS_description.sql`).

---

## 3. Auth & Role-Based Access Control

- Sign-up flow: email + password + role selection (`donor`, `ngo`, `volunteer`). Admins are seeded manually / promoted by another admin — no public admin sign-up.
- After sign-up, insert a `profiles` row via a Postgres trigger on `auth.users` insert (`handle_new_user()` function) rather than client-side insert, to avoid race conditions.
- `donor` and `ngo` accounts start `verification_status = 'pending'` and are blocked from creating/claiming donations until an admin sets `verified`.
- Route protection: implement a `middleware.ts` that checks Supabase session + role for `/dashboard/donor/*`, `/dashboard/ngo/*`, `/dashboard/volunteer/*`, `/dashboard/admin/*`.
- Use a shared `getUserProfile()` server helper to fetch role + verification status on every protected server component.

---

## 4. Application Route Map (Next.js App Router)

```
/                                landing page
/login
/signup
/verify-email
/onboarding                      role-specific profile completion

/dashboard/donor
/dashboard/donor/donations
/dashboard/donor/donations/new
/dashboard/donor/donations/[id]
/dashboard/donor/donations/[id]/edit
/dashboard/donor/analytics

/dashboard/ngo
/dashboard/ngo/browse            list + filter available donations
/dashboard/ngo/claims
/dashboard/ngo/claims/[id]
/dashboard/ngo/analytics

/dashboard/volunteer
/dashboard/volunteer/deliveries
/dashboard/volunteer/deliveries/[id]
/dashboard/volunteer/analytics

/dashboard/admin
/dashboard/admin/users
/dashboard/admin/verifications
/dashboard/admin/donations
/dashboard/admin/analytics

/api/ai/prioritize                POST — recompute priority_score for a donation
/api/ai/match                     POST — return ranked NGO recommendations for a donation
/api/ai/impact-report             POST — generate narrative impact summary
/api/notifications/send           POST — internal, triggers notification insert + email
```

---

## 5. Core Module Specs

### 5.1 Donation Creation (Donor)
Form fields exactly per PRD Section 7.2 required fields. Use Zod schema mirroring
the `donations` table. Image upload → Supabase Storage bucket `donation-images`,
store returned paths in `images[]`. On submit: insert row with `status = 'available'`,
then call `/api/ai/prioritize` to populate `priority_score` (fire-and-forget, non-blocking).

### 5.2 Discovery & Claim (NGO)
`/dashboard/ngo/browse`: server-rendered list of `donations` where `status = 'available'`,
sorted by `priority_score desc, expiry_at asc`. Filters: category, quantity range,
expiry window, distance (compute via lat/lng haversine, either in a Postgres function
or client-side after fetch). "Claim" action: transaction that inserts into `claims`
and updates `donations.status = 'reserved'` — must be atomic (use a Postgres RPC
function `claim_donation(donation_id, ngo_id)` to prevent race conditions on
concurrent claims).

### 5.3 Logistics & Delivery (Volunteer)
On claim confirmation, a `deliveries` row is created with `status = 'unassigned'`.
Volunteers see unassigned deliveries filtered by proximity to pickup location.
Accepting sets `volunteer_id` + `status = 'assigned'`. Status transitions are
volunteer-driven button actions; each transition writes a timestamp and triggers
a notification to donor + NGO. Delivery proof upload → Storage bucket
`delivery-proof`, required before `status` can move to `delivered`.

### 5.4 Notifications
Implement as a Postgres trigger (`AFTER INSERT/UPDATE` on `donations`, `claims`,
`deliveries`) that inserts into `notifications`. Frontend: a notification bell
using Supabase Realtime subscription on the `notifications` table filtered to
`user_id = auth.uid()`. Email delivery (optional Phase 2): Supabase Auth SMTP
or a transactional email API — stub this as a TODO if out of initial scope.

### 5.5 Analytics Dashboards
Each role dashboard queries aggregate views. Create Postgres views:
- `donor_stats` (per donor: total donations, meals donated, waste prevented kg, trend by month)
- `ngo_stats` (per ngo: donations received, beneficiaries served est., history)
- `volunteer_stats` (per volunteer: deliveries completed, avg delivery time)
- `admin_stats` (platform-wide: active users, recovery rate, completion rate)

Render with simple charting (recharts, already compatible with the frontend-design skill's
available libraries) — bar/line charts for trends, stat cards for totals.

---

## 6. AI Feature Specs (implement after core CRUD is solid — Phase 4)

### 6.1 Smart Donation Prioritization (`/api/ai/prioritize`)
Input: donation record (category, quantity, expiry_at, historical collection data
for that donor/category). Call OpenAI with a structured-output prompt requesting
a single JSON object: `{ "priority_score": number (0-100), "reasoning": string }`.
Store `priority_score` on the donation. Recompute on a scheduled basis (e.g. hourly
cron via Vercel Cron) for all `available` donations to keep urgency current as
expiry approaches, not just at creation.

### 6.2 Intelligent Matching Engine (`/api/ai/match`)
Input: a donation. Query candidate NGOs (verified, active) with distance,
recent claim history, and stated capacity/food-type preferences (add a
`preferences jsonb` column to `profiles` for NGOs if not already covered).
Send a compact JSON summary of donation + candidate NGOs to OpenAI, ask for a
ranked list with short justifications. Return ranked list to the donor/admin UI
as "Suggested recipients" — this is a recommendation surface, not an automatic
assignment; NGOs still must actively claim.

### 6.3 Impact Analytics Generation (`/api/ai/impact-report`)
Input: aggregate stats (from the views in 5.5) for a date range. Prompt OpenAI
to produce a short narrative summary (2-4 sentences) plus key numbers, for
donor/NGO/admin dashboards — e.g. "This month you helped recover ~X kg of food,
preventing an estimated Y kg of CO2e emissions and providing Z meals."
Use a documented, transparent estimation formula for CO2e (do not let the model
invent conversion factors) — hardcode a factor such as 2.5 kg CO2e per kg of
food waste avoided (cite as an approximation, adjustable in config).

### 6.4 Demand Forecasting
Simplest viable version: a Postgres query aggregating historical claims by
category + location + week, surfaced as a chart ("high-demand categories in
your area"). True predictive forecasting via OpenAI can be a stretch goal —
mark as **Phase 5 / stretch** since it isn't required for MVP.

**General AI implementation rule:** All AI calls go through Next.js API routes
(never call OpenAI from the client) so the API key stays server-side. Always
validate/parse model output with Zod before trusting it; fall back to a
deterministic rule-based score (e.g. simple weighted formula on expiry
proximity + quantity) if the AI call fails, so core functionality never
depends on AI availability.

---

## 7. Component Inventory (ShadCN-based)

- `DonationCard`, `DonationForm`, `DonationStatusBadge`, `DonationFilterBar`
- `ClaimButton`, `ClaimStatusTimeline`
- `DeliveryStatusStepper`, `DeliveryProofUpload`
- `StatCard`, `TrendChart`, `ImpactSummaryCard`
- `NotificationBell`, `NotificationList`
- `RoleGuard` (wrapper for client components needing role checks)
- `VerificationBadge`, `AdminVerificationQueue`
- `ImageUploader` (shared, used by donation creation + delivery proof)

---

## 8. Non-Functional Implementation Notes

- **Security:** All mutations go through Supabase RLS + server actions/route
  handlers — never trust client-submitted `user_id`/`role`. Validate all input
  with Zod on the server regardless of client-side validation.
- **Performance:** Use Next.js server components for list/detail pages (donations
  browse, dashboards) to minimize client JS. Paginate donation lists (cursor or
  offset, 20/page). Use Supabase Storage image transforms for thumbnails.
- **Reliability:** Wrap AI route handlers in try/catch with the deterministic
  fallback described in 6.4. Log errors (console + optionally Sentry, stretch).
- **Scalability:** Keep DB access patterns index-friendly — add indexes on
  `donations(status, expiry_at)`, `donations(category)`, `claims(ngo_id)`,
  `deliveries(volunteer_id, status)`.

---

## 9. Out of Scope (Phase 1) — reaffirmed

Do not build: payments, government integrations, native mobile apps, IoT
sensors, or true route optimization. Keep these as clearly marked stretch
sections in the codebase (e.g. commented TODOs) rather than partial
implementations.

---

## 10. Success Metrics to Instrument From Day 1

Add lightweight event logging (a simple `events` table or analytics table) for:
donations created, meals redistributed (sum of `estimated_meals` on completed
donations), waste reduction % (completed vs expired/cancelled), delivery
completion rate, average pickup-to-delivery time, active organizations count,
weekly/monthly active users. These feed directly into the analytics dashboards
in Section 5.5.

---

## 11. Build Phases (feed to agent sequentially)

**Phase 0 — Scaffolding**
Next.js + TypeScript + Tailwind + ShadCN init. Supabase project connected.
Base folder structure, env vars, auth pages (login/signup/verify-email).
*DoD: a user can sign up, verify email, and log in; a `profiles` row is created automatically with correct role.*

**Phase 1 — Roles & Profiles**
Onboarding flow per role, admin verification queue, middleware route protection.
*DoD: unverified donor/ngo cannot access donation-creation/claim actions; admin can approve/reject and it takes effect immediately.*

**Phase 2 — Donation Lifecycle**
Donation CRUD, image upload, status workflow, browse/filter for NGOs, atomic
claim RPC.
*DoD: full path — donor creates donation → NGO claims it → donation status updates correctly → race condition on double-claim is prevented.*

**Phase 3 — Logistics**
Delivery creation on claim, volunteer accept/status flow, proof upload,
notifications for all major transitions.
*DoD: a donation can be walked end-to-end from `available` to `completed` by three different role accounts, with correct notifications firing at each step.*

**Phase 4 — Analytics + AI**
Postgres stat views, dashboards per role, AI prioritization, AI matching
suggestions, AI impact narrative, with deterministic fallbacks.
*DoD: dashboards show accurate real numbers; AI endpoints return valid structured data or gracefully fall back without breaking the UI.*

**Phase 5 — Polish / Stretch**
Realtime notification bell, demand forecasting view, email notifications,
performance pass, empty/error states, responsive QA.

---

## 12. Notes for the Coding Agent

- Prefer Postgres RPC functions for any operation that must be atomic (claiming
  a donation, assigning a delivery) over multi-step client-side logic.
- Keep AI calls isolated behind server routes with strict output validation —
  the rest of the app must function even if OpenAI is unavailable.
- Match the exact status enums in Section 2.6 everywhere (UI badges, filters,
  DB constraints) — do not invent additional statuses.
- Ask for clarification only if a requirement here conflicts with itself;
  otherwise default to the simplest implementation that satisfies the stated
  Definition of Done for the current phase before optimizing further.