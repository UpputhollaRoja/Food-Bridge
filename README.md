This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 🔒 Supabase Auth & Local Signup Setup

### Local Development (Avoid Email Rate Limits)
Supabase's built-in email service is heavily rate-limited and will reject signup requests with a `rate limit exceeded` error after a few attempts. During development, you should disable email confirmation:
1. Log in to your **Supabase Dashboard** (`https://supabase.com/dashboard`).
2. Go to **Project Settings** (gear icon) > **Auth** settings.
3. Under the **User Signups** section, toggle **Confirm email** to **OFF**.
4. Save the changes. 
*Note: The signup flow in `src/app/auth/actions.ts` dynamically detects this and redirects users directly to `/onboarding` without blocking.*

### Production Launch Requirements
Before deploying the application to production:
1. **Re-enable Confirm email** under Project Settings > Auth > User Signups.
2. **Configure custom SMTP**:
   - Go to **Project Settings** > **Auth** > **SMTP Settings** in your Supabase Dashboard.
   - Toggle **Enable Custom SMTP** on.
   - Fill in your SMTP provider host, port, username, password, and sender email details (using a service like **Resend**, **Postmark**, **SendGrid**, or **Amazon SES**).
   - This ensures secure, unlimited, and brand-consistent transactional emails to your users.

---

## 🛡️ Pre-Deployment Audit Results

An end-to-end audit covering both the backend and frontend systems of the Food Bridge application was completed successfully.

### 1. Backend Security & Data Integrity

- **Fixed:** The `profiles` table Row Level Security (RLS) policies were missing `WITH CHECK` constraints for `UPDATE` operations. This allowed any authenticated user to manually escalate their privileges by setting `role = 'admin'` or `verification_status = 'verified'` via the client API.
- **Correction:** 
  - Created a PostgreSQL trigger that blocks non-admin users from modifying their `role` or `verification_status`.
  - Updated `src/app/onboarding/actions.ts` to use `createAdminClient` so that legitimate onboarding changes can bypass the trigger safely.

### 2. API Security & Efficiency

- **Fixed:** The AI endpoints (`/api/ai/impact-report`, `/api/ai/match`, `/api/ai/prioritize`) were completely unauthenticated. An attacker could flood these endpoints, resulting in excessive OpenAI API costs or quota exhaustion.
- **Correction:** 
  - Modified all three AI API routes to initialize the Supabase client using the request cookies and verify the session using `supabase.auth.getUser()`.
  - Unauthenticated requests are now rejected early with `401 Unauthorized` before any expensive LLM operations are triggered.

### 3. Frontend Performance & Accessibility

- **Fixed:** Images stored in Supabase storage were not configured for optimization by the Next.js `<Image>` component.
- **Correction:** Added `dyegriefrxgoqwgtkqdm.supabase.co` to the `remotePatterns` array in `next.config.ts`, enabling automatic Next.js image optimization and CDN edge caching.
- **Fixed:** React hooks in `NotificationBell.tsx` and `ReportModal.tsx` were incorrectly calling `setState` inside `useEffect` bodies, triggering cascading re-renders. Refactored to align with React 18 Strict Mode best practices.

### 4. Runtime UI & Responsive Design

An automated browser test navigated through the core user flows on both **Desktop (1280x800)** and **Mobile (375x812)** viewports.
- **Homepage:** Scales beautifully. Hero section typography and cards flow vertically on mobile without overflow or Cumulative Layout Shift (CLS).
- **Login / Signup:** Input fields are properly accessible, responsive, and maintain contrast.
- **Route Protection:** Direct navigation to `/onboarding` correctly redirected the unauthenticated session to `/login`.
- **Console Errors:** 0 client-side JS exceptions or network failures during navigation.
