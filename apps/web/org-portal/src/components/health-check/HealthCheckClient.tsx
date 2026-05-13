"use client";

import { useEffect, useState } from "react";
import { Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";

type HealthCheckResult = {
  status: string;
  timestamp: string;
  endpoints?: Record<string, { status: string; code?: number; error?: string; time?: number }>;
  error?: string;
};

export function HealthCheckClient() {
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health");
      const data = (await res.json()) as HealthCheckResult;
      setResult(data);
      if (!res.ok) {
        setError(`Health check returned ${res.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check health");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void checkHealth();
  }, []);

  const isHealthy = result?.status === "healthy";
  const isDegraded = result?.status === "degraded";

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">API Health Check</h1>
          <p className="mt-2 text-muted-foreground">
            Verify that your backend API is properly configured and accessible
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-muted-foreground">Checking API health...</span>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive">Health Check Failed</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <div className="flex items-center gap-3">
                  {isHealthy ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  ) : isDegraded ? (
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <p className="font-semibold capitalize">{result.status} API Status</p>
                    <p className="text-xs text-muted-foreground">{result.timestamp}</p>
                  </div>
                </div>
                <button
                  onClick={checkHealth}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Refresh
                </button>
              </div>

              {result.endpoints && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Endpoint Status</h3>
                  {Object.entries(result.endpoints).map(([name, endpoint]) => (
                    <div key={name} className="flex items-start justify-between rounded-lg border border-border p-4">
                      <div className="flex items-start gap-3">
                        {endpoint.status === "ok" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium">{name}</p>
                          {endpoint.status === "ok" ? (
                            <p className="text-xs text-emerald-600">Status {endpoint.code}</p>
                          ) : (
                            <p className="text-xs text-destructive">{endpoint.error}</p>
                          )}
                        </div>
                      </div>
                      {endpoint.time && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {endpoint.time}ms
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!isHealthy && (
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Troubleshooting</h4>
                  <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>Ensure the backend API is running on <code className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-xs">http://localhost:8000</code></li>
                    <li>Check that the database is initialized and accessible</li>
                    <li>Verify your authentication token is valid</li>
                    <li>Review the backend API logs for errors</li>
                    <li>Ensure CORS is properly configured if using different domains</li>
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="mt-8 rounded-lg border border-border bg-muted/50 p-6">
          <h3 className="font-semibold mb-4">System Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frontend URL:</span>
              <code className="font-mono">{typeof window !== "undefined" ? window.location.origin : "N/A"}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backend API Base:</span>
              <code className="font-mono">http://localhost:8000</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment:</span>
              <code className="font-mono">Development</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
