"use client";

import { useState } from "react";
import { Search, MapPin, Pill, ArrowRight, Loader2, Navigation, AlertTriangle } from "lucide-react";

type PharmacyResult = {
  organization_id: string;
  pharmacy_name: string;
  contact_email: string;
  stock_level: number;
  unit_price: number;
  status: string;
};

export default function PharmaciesSearchPage() {
  const [medId, setMedId] = useState("");
  const [results, setResults] = useState<PharmacyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // In a real implementation, we'd have an autocomplete for medication names -> IDs.
  // For this prototype, we'll allow entering a Medication ID.
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medId.trim()) return;
    
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/pharmacies/search?medication_id=${encodeURIComponent(medId.trim())}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto pb-10 px-4 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Nearby Pharmacies</h1>
          <p className="text-sm text-muted-foreground mt-1">Find medications in stock at local partner pharmacies.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={medId}
              onChange={(e) => setMedId(e.target.value)}
              placeholder="Enter Medication ID to check stock..."
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-sky-500 text-sm"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !medId}
            className="h-12 px-6 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            Find Stock
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Search Results</h2>
          
          {loading ? (
             <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-border rounded-xl bg-card">
               <Loader2 className="h-8 w-8 animate-spin mb-4 text-sky-500" />
               <p>Searching inventory across partner pharmacies...</p>
             </div>
          ) : results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground bg-card/50">
              <AlertTriangle className="mx-auto h-12 w-12 opacity-40 mb-4 text-amber-500" />
              <p className="text-base font-medium text-foreground">No stock found</p>
              <p className="text-sm mt-1">We couldn't find any pharmacies currently stocking this medication.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((r) => (
                <div key={r.organization_id} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 flex items-center justify-center">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{r.pharmacy_name}</h3>
                        <p className="text-xs text-muted-foreground">{r.contact_email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-y border-border my-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Stock</p>
                      <p className={`font-bold ${r.stock_level > 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {r.stock_level} units
                      </p>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Est. Price</p>
                      <p className="font-bold">${r.unit_price.toFixed(2)}</p>
                    </div>
                  </div>

                  <button className="w-full h-10 border border-border bg-background hover:bg-muted text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition">
                    <Navigation className="h-4 w-4 text-sky-600 dark:text-sky-400" /> Get Directions
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
