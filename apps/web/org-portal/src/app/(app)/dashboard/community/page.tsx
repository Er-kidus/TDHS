"use client";

import { useEffect, useState } from "react";
import { Users, Map, Plus, Search, Filter, MapPin, ChevronRight, Activity, AlertTriangle } from "lucide-react";

type CommunityArea = {
  id: string;
  name: string;
  description: string;
  region_code: string;
};

type Household = {
  id: string;
  area_id: string;
  head_name: string;
  contact_number: string;
  address: string;
  risk_level: "green" | "yellow" | "red" | "critical";
  created_at: string;
};

export default function CommunityOperationsDashboard() {
  const [areas, setAreas] = useState<CommunityArea[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [areasRes, hhRes] = await Promise.all([
          fetch("/api/org/community/areas"),
          fetch("/api/org/community/households")
        ]);
        
        if (areasRes.ok) {
          const a = await areasRes.json();
          setAreas(Array.isArray(a) ? a : []);
        }
        if (hhRes.ok) {
          const h = await hhRes.json();
          setHouseholds(Array.isArray(h) ? h : []);
        }
      } catch (err) {
        console.error("Failed to load community data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Community Operations</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage field agents, community areas, and household tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-sm transition">
            <Plus className="h-4 w-4" /> Register Household
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Monitored Households" value={households.length} icon={<MapPin className="h-4 w-4 text-indigo-600" />} />
        <MetricCard title="Community Areas" value={areas.length} icon={<Map className="h-4 w-4 text-emerald-600" />} />
        <MetricCard title="Field Agents Active" value={0} icon={<Users className="h-4 w-4 text-sky-600" />} />
        <MetricCard title="At-Risk Households" value={households.filter(h => h.risk_level === "red" || h.risk_level === "critical").length} icon={<AlertTriangle className="h-4 w-4 text-rose-600" />} alert />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Household Registry</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search households..."
                  className="h-9 pl-9 pr-4 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring text-sm w-64"
                />
              </div>
              <button className="h-9 px-3 border border-input bg-background rounded-md text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filter
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-5 py-3.5">Household Head</th>
                  <th className="px-5 py-3.5">Area</th>
                  <th className="px-5 py-3.5">Risk Level</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Loading registry...</td>
                  </tr>
                ) : households.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No households registered.</td>
                  </tr>
                ) : (
                  households.map(hh => (
                    <tr key={hh.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium">{hh.head_name}</p>
                        <p className="text-xs text-muted-foreground">{hh.address}</p>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {areas.find(a => a.id === hh.area_id)?.name || "Unknown Area"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium capitalize 
                          ${hh.risk_level === 'green' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400' : 
                            hh.risk_level === 'yellow' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400' : 
                            'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400'}`}>
                          {hh.risk_level === 'red' || hh.risk_level === 'critical' ? <AlertTriangle className="h-3 w-3" /> : null}
                          {hh.risk_level}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted text-muted-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Community Areas</h2>
          <div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Loading areas...</div>
            ) : areas.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No areas defined.</div>
            ) : (
              areas.map(area => (
                <div key={area.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{area.name}</p>
                    <p className="text-xs text-muted-foreground">{area.region_code}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
                    {households.filter(h => h.area_id === area.id).length} HHs
                  </span>
                </div>
              ))
            )}
            <div className="p-4 bg-muted/20">
              <button className="w-full h-9 border border-input bg-background hover:bg-muted rounded-md text-sm font-medium flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Add Area
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, alert }: { title: string, value: number | string, icon: React.ReactNode, alert?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${alert ? "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30" : "bg-card border-border"}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border border-border/50 shadow-sm">
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold mt-2 ${alert ? "text-rose-700 dark:text-rose-400" : ""}`}>{value}</p>
    </div>
  );
}
