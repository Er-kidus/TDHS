"use client";

import { type ReactNode, useState, useEffect } from "react";
import { AlertCircle, RotateCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

export function DoctorErrorBoundary({ children }: Props) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setHasError(true);
      setError(new Error(event.reason?.message || String(event.reason)));
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full rounded-lg border border-destructive/50 bg-destructive/5 p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-8 w-8 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Dashboard</h1>
              <p className="text-muted-foreground mb-4">
                {error?.message || "An error occurred while loading the doctor dashboard. This is often due to API connectivity issues."}
              </p>
              
              <div className="bg-background rounded-md p-4 mb-6 font-mono text-sm text-muted-foreground max-h-32 overflow-auto">
                <div className="text-xs text-destructive mb-2">Error Details:</div>
                {error?.message}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-4 mb-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Troubleshooting Steps:</h3>
                <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>Ensure the backend API is running on <code className="bg-white dark:bg-slate-900 px-2 py-1 rounded">http://localhost:8000</code></li>
                  <li>Check that the database is properly initialized</li>
                  <li>Verify your authentication token is valid</li>
                  <li>Try refreshing the page with F5 or Ctrl+Shift+R</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setHasError(false);
                  setError(null);
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
              >
                <RotateCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
