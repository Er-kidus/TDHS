import { Activity } from "lucide-react";

export default function HealthTrackerPage() {
  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Health Tracker</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your key health metrics across time.</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Weight (kg)", value: "68.4" },
          { label: "Blood Pressure", value: "122/78" },
          { label: "Blood Sugar", value: "104 mg/dL" },
          { label: "Heart Rate", value: "72 bpm" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-lg border border-border bg-background p-3 text-sm">
            <p className="text-muted-foreground">{metric.label}</p>
            <p className="text-lg font-semibold mt-1">{metric.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold inline-flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Trends</h2>
          <div className="inline-flex rounded-lg border border-border p-1 text-xs">
            <button className="rounded-md px-2 py-1 bg-accent">Daily</button>
            <button className="rounded-md px-2 py-1">Weekly</button>
            <button className="rounded-md px-2 py-1">Monthly</button>
          </div>
        </div>
        <div className="h-48 rounded-lg border border-dashed border-border bg-background grid place-items-center text-sm text-muted-foreground">
          Graph placeholder for metric trends
        </div>
      </section>
    </div>
  );
}
