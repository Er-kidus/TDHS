# Backend Endpoint Tester (Python UI)

Simple Tkinter UI to test API gateway endpoints for different actors.

## Run

```powershell
cd tools/backend-endpoint-tester
python endpoint_tester.py
```

## What It Supports

- Base URL input (default `http://localhost:8000`)
- Method selection (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)
- Endpoint quick-pick + manual edit
- Actor contexts:
  - `public`
  - `patient`
  - `org-admin`
  - `superadmin`
- Per-actor bearer token storage
- JSON request body input
- Response status, headers, and body output

## Notes

- For non-`public` requests, paste the JWT token in the matching actor token field.
- If an endpoint returns an error, full response body is shown in the output panel.
