# Admin Organization Dashboard

Small full-stack admin dashboard for creating organizations, inviting members, and viewing the organizations managed by the signed-in admin.

## Stack

- React 18, TypeScript strict mode, Vite with SWC
- React Router v6 protected routes
- Tailwind CSS with shadcn/ui-style Radix primitives
- TanStack React Query for server state
- React Hook Form and Zod for forms
- Supabase Auth, Postgres, RLS, and Edge Functions

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project and copy `.env.example` to `.env.local`:

   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Apply the database migration:

   ```bash
   supabase db push
   ```

4. Deploy the Edge Function:

   ```bash
   supabase functions deploy invite-member
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

## Supabase Notes

The migration in `supabase/migrations/202605300001_initial_schema.sql` creates:

- `profiles`
- `organizations`
- `organization_members`
- `organization_directory` view
- enums for organization type, member status, and member role
- RLS policies on every table
- an auth trigger that creates a profile for each signed-up user

The `invite-member` Edge Function validates the request body, verifies the caller owns the organization, and inserts the invitation using the service role key. Duplicate organization/email invitations are blocked by a unique constraint.

## Branching Strategy

Recommended workflow for submission:

- `main`: production branch, deployed to Vercel Production
- `development`: working branch, deployed to a stable Vercel Preview
- short-lived feature branches off `development`
- merge at least two pull requests into `development`
- merge `development` into `main` when stable

## Deployment

Vercel is configured as a Vite app through `vercel.json`.

- Production deployment should track `main`.
- Preview deployment should track `development`.
- Both environments need `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Example PR scopes:

- `feat: scaffold auth and protected shell`
- `feat: add organizations and invitation flow`

## Environment Variables

Vercel should define:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in the Vercel frontend project. Supabase automatically provides it to Edge Functions in the Supabase runtime.

## Test Credentials

Create a seeded user in Supabase Auth, then mark its profile as admin before submission:

```sql
update public.profiles
set is_admin = true
where email = 'admin@example.com';
```

Add the credentials here:

```text
Email: admin@example.com
Password: replace-with-real-password
```

Use `docs/submission-checklist.md` for the final handoff pass before sharing the repository.

## Tradeoffs

- Email delivery is intentionally not implemented. The invitation record is created server-side, and the Edge Function is where a provider such as Resend or Postmark would be added.
- Sign-up creates a non-admin profile. A seeded reviewer/admin account must be promoted by updating `profiles.is_admin`.
- Organization creation uses client-side Zod validation plus database constraints. Invitation validation is repeated in the Edge Function.

## With Another Day

- Add invitation acceptance and link accepted rows to `auth.users`.
- Add role-based organization permissions beyond the creator admin.
- Add Playwright coverage for sign-in, create organization, and invite member.
- Add search and filters to the directory.
