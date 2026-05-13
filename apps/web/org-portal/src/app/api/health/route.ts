import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function GET() {
  try {
    const auth = await orgAuthHeaderFromCookie();
    const results: Record<string, { status: string; code?: number; error?: string; time?: number }> = {};

    // Test each API endpoint
    const endpoints = [
      { name: "Doctors", path: "/org/doctors" },
      { name: "Appointments", path: "/appointments?limit=10" },
      { name: "Queues", path: "/queues" },
      { name: "Patients", path: "/org/patients?limit=10" },
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        const response = await backendFetch(endpoint.path, {
          method: "GET",
          headers: { ...auth },
        });
        const time = Date.now() - startTime;
        results[endpoint.name] = {
          status: "ok",
          code: response.status,
          time,
        };
      } catch (error) {
        const time = Date.now() - startTime;
        results[endpoint.name] = {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
          time,
        };
      }
    }

    const allOk = Object.values(results).every((r) => r.status === "ok");

    return NextResponse.json(
      {
        status: allOk ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        endpoints: results,
      },
      { status: allOk ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
