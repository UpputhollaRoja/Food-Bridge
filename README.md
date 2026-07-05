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
