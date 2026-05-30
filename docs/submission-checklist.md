# Submission Checklist

- GitHub repository has `main` and `development` branches.
- At least two pull requests are merged into `development`.
- Supabase migration is applied to the target project.
- `invite-member` Edge Function is deployed.
- Vercel production deployment uses `main`.
- Vercel preview deployment uses `development`.
- Vercel environments include `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- A reviewer admin user is seeded and promoted with `profiles.is_admin = true`.
- README includes live URLs, reviewer credentials, tradeoffs, and next steps.
- Loom walkthrough is recorded and linked in the submission form.
