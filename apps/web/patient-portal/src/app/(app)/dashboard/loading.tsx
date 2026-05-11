export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <div className="h-5 w-40 rounded-lg bg-muted" />
        <div className="h-8 w-64 rounded-lg bg-muted" />
        <div className="h-4 w-full max-w-xl rounded-lg bg-muted" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl border border-border bg-card" />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 h-72 rounded-2xl border border-border bg-card" />
        <div className="h-72 rounded-2xl border border-border bg-card" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-56 rounded-2xl border border-border bg-card" />
        ))}
      </div>
    </div>
  );
}
