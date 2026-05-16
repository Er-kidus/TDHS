"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, Package, AlertTriangle, ArrowDownToLine, Archive } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  generic_name: string;
  dosage_form: string;
  strength: string;
};

type InventoryItem = {
  id: string;
  medication_id: string;
  stock_level: number;
  reorder_level: number;
  unit_price: number;
  status: "in_stock" | "low_stock" | "out_of_stock" | "discontinued";
  last_restocked: string;
  medication: Medication;
};

export default function PharmacyInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/org/pharmacy/inventory");
        if (res.ok) {
          const data = await res.json();
          setInventory(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const lowStock = inventory.filter(i => i.stock_level <= i.reorder_level);
  const outOfStock = inventory.filter(i => i.stock_level === 0);

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage medication stock levels, pricing, and reorder thresholds.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-sm transition">
            <Plus className="h-4 w-4" /> Add Stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Medications" value={inventory.length} icon={<Package className="h-4 w-4 text-emerald-600" />} />
        <MetricCard title="Low Stock Alerts" value={lowStock.length} icon={<ArrowDownToLine className="h-4 w-4 text-amber-600" />} alert="yellow" />
        <MetricCard title="Out of Stock" value={outOfStock.length} icon={<AlertTriangle className="h-4 w-4 text-rose-600" />} alert="red" />
        <MetricCard title="Total Units" value={inventory.reduce((acc, curr) => acc + curr.stock_level, 0)} icon={<Archive className="h-4 w-4 text-sky-600" />} />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-border bg-muted/20 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search inventory by medication or generic name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          <button className="h-9 px-3 border border-input bg-background rounded-md text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-5 py-3.5">Medication</th>
                <th className="px-5 py-3.5 text-right">Stock Level</th>
                <th className="px-5 py-3.5 text-right">Reorder At</th>
                <th className="px-5 py-3.5 text-right">Unit Price</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Last Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">Loading inventory...</td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">Inventory is empty.</td>
                </tr>
              ) : (
                inventory.filter(i => 
                  i.medication.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  i.medication.generic_name.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(item => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">{item.medication.name}</p>
                      <p className="text-xs text-muted-foreground">{item.medication.generic_name} • {item.medication.strength} {item.medication.dosage_form}</p>
                    </td>
                    <td className={`px-5 py-3.5 text-right font-medium ${item.stock_level <= item.reorder_level ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                      {item.stock_level}
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground">
                      {item.reorder_level}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium">
                      ${item.unit_price.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.stock_level === 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' :
                        item.stock_level <= item.reorder_level ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      }`}>
                        {item.stock_level === 0 ? 'Out of Stock' : item.stock_level <= item.reorder_level ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-muted-foreground">
                      {item.last_restocked ? new Date(item.last_restocked).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, alert }: { title: string, value: number | string, icon: React.ReactNode, alert?: "red" | "yellow" }) {
  const alertClasses = {
    red: "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30",
    yellow: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30",
  };
  const wrapperClass = alert ? alertClasses[alert] : "bg-card border-border";
  
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${wrapperClass}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border border-border/50 shadow-sm">
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold mt-2 ${alert === 'red' ? "text-rose-700 dark:text-rose-400" : alert === 'yellow' ? "text-amber-700 dark:text-amber-400" : ""}`}>{value}</p>
    </div>
  );
}
