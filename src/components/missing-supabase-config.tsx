export function MissingSupabaseConfig() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <div className="w-full max-w-xl rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Supabase configuration required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a <code className="rounded bg-muted px-1 py-0.5">.env.local</code> file with your Supabase project URL
          and anon key, then restart the dev server.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-4 text-sm">
{`VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
      </div>
    </div>
  );
}
