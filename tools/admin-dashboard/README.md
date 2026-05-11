# Tenadam Python Admin Dashboard

A local operations dashboard for running the Tenadam stack, monitoring service health, and managing ngrok tunnels.

## What it controls

- Backend: `postgres`, `redis`, `api-gateway` via `docker compose`
- Frontend: `patient-portal` (`:3000`) and `org-portal` (`:4000`) via `npm --prefix ... run dev`
- Additional local apps: `org-registration-portal` (`:4173`) and the super admin portal (`:5000`)
- Public tunnels: patient and organization ngrok endpoints

## Requirements

- Windows with Python 3.10+
- Docker Desktop running
- Node.js + npm installed
- Dependencies installed in:
  - `apps/web/patient-portal`
  - `apps/web/org-portal`

## Run

From repository root:

```powershell
python tools/admin-dashboard/dashboard.py
```

## Buttons

- `Start Backend`: `docker compose up -d postgres redis api-gateway`
- `Stop Backend`: `docker compose stop api-gateway redis postgres`
- `Start Frontend`: starts both Next.js dev servers
- `Stop Frontend`: kills both frontend process trees
- `Restart All`: stop everything, then start backend and frontend in sequence
- `Stop All`: stop backend and frontend

## ngrok setup

The dashboard now supports separate ngrok accounts for patient and organization tunnels.

Option 1:
Save both tokens inside the dashboard UI. They will be written to `tools/admin-dashboard/.env.local`, which is ignored by git.

Option 2:
Set these environment variables yourself before launching the dashboard:

```powershell
$env:NGROK_AUTHTOKEN_PATIENT="..."
$env:NGROK_AUTHTOKEN_ORG="..."
python tools/admin-dashboard/dashboard.py
```

If you only use one ngrok account, the dashboard still honors the shared `NGROK_AUTHTOKEN` environment variable or your default ngrok config.

## Notes

- Live port badges monitor the full local stack, including the portals, API gateway, LiveKit, and ngrok admin ports.
- Port and ngrok refreshes run in background threads so the Tk window stays responsive.
- Frontend process logs are written to:
  - `tools/admin-dashboard/logs/patient.log`
  - `tools/admin-dashboard/logs/org.log`
