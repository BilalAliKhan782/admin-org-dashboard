# Admin Organization Dashboard

Small full-stack admin dashboard for creating organizations, inviting members, and viewing the organizations managed by the signed-in admin.

## Deliverables

- GitHub repository: https://github.com/BilalAliKhan782/admin-org-dashboard
- Production: https://admin-org-dashboard.vercel.app
- Development preview: https://admin-org-dashboard-development.vercel.app
- Supabase project ref: `snsfkiycaohtzgvsmaow`
- Loom walkthrough: TODO

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

The `invite-member` Edge Function validates the request body, verifies the caller is the creator or an active manager, and inserts the invitation using the service role key. Duplicate organization/email invitations are blocked by a unique constraint.

Invitation links use `/accept-invitation/:token`. The token lookup and acceptance flow are handled by security-definer RPC functions so pending invitation rows are not broadly exposed through anonymous RLS reads.

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
- `VITE_SENTRY_DSN` optional, enables Sentry in production
- `VITE_POSTHOG_KEY` optional, enables PostHog analytics

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in the Vercel frontend project. Supabase automatically provides it to Edge Functions in the Supabase runtime.

Supabase Edge Function secrets can optionally define:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Environments

- **Development**: Use a separate Supabase project such as `admin-org-dashboard-dev` for testing migrations, invitations, and E2E data.
- **Production**: Main Supabase project, currently `snsfkiycaohtzgvsmaow`.

To switch environments locally, update `.env.local` with the matching project credentials:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For a new development Supabase project, link the project, apply migrations, and deploy the Edge Function:

```bash
supabase link --project-ref your-dev-project-ref
supabase db push
supabase functions deploy invite-member
```

In Vercel, enable `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Production, Preview, and Development environments.

## Test Credentials

Seeded reviewer admin:

```text
Email: reviewer@adminorg.dev
Password: BilalAdmin!2026
```

To create another admin user, create the user in Supabase Auth, then promote its profile:

```sql
update public.profiles
set is_admin = true
where email = 'admin@example.com';
```

Use `docs/submission-checklist.md` for the final handoff pass before sharing the repository.

## Testing

### Unit Tests

```bash
npm test                 # Run tests
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report
```

### E2E Tests

```bash
npx playwright install
npm run test:e2e         # Run Playwright tests
npm run test:e2e:ui      # Open Playwright UI
```

The E2E test uses the reviewer admin credentials and creates a unique organization/invitation for each run.

## Features

### Core Features

- Authentication with Supabase Auth
- Organization creation and directory browsing
- Member invitation system with expiring acceptance links
- Role-based member management with member and manager roles
- Dark mode support
- Search, filtering, sorting, pagination, and CSV export
- Responsive design

### Advanced Features

- Magic-link invitation acceptance
- Activity audit log
- Email notifications with Resend when configured
- Error tracking with Sentry when configured
- Analytics with PostHog when configured
- Offline shell support with a production service worker

### Performance

- React Query caching
- Debounced organization filtering
- Paginated directory rendering
- Page-load performance events
- Loading skeletons for organization cards

## Tradeoffs

- Email delivery, Sentry, PostHog, and Upstash rate limiting are opt-in through environment variables so local development can run without those external services.
- Sign-up creates a non-admin profile. A seeded reviewer/admin account must be promoted by updating `profiles.is_admin`.
- Organization creation uses client-side Zod validation plus database constraints. Invitation validation is repeated in the Edge Function.

## With Another Day

- Add cleanup tooling for E2E-created test organizations.
- Expand the activity log into a dedicated timeline with filters.
