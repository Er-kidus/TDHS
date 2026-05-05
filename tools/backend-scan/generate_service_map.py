from __future__ import annotations

import json
import re
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]
SERVICES_DIR = ROOT / "services"
ROUTES_FILE = ROOT / "gateway" / "api-gateway" / "api" / "routes.go"
OUT_JSON = ROOT / "apps" / "web" / "org-portal" / "src" / "data" / "service-map.json"
OUT_MD = ROOT / "docs" / "patient-portal-backend-api.md"


def scan_services() -> list[dict]:
    data: list[dict] = []
    if not SERVICES_DIR.exists():
        return data

    for domain in sorted(p for p in SERVICES_DIR.iterdir() if p.is_dir()):
        for svc in sorted(p for p in domain.iterdir() if p.is_dir()):
            files = sum(1 for _ in svc.rglob("*") if _.is_file())
            data.append(
                {
                    "domain": domain.name,
                    "name": svc.name,
                    "path": str(svc.relative_to(ROOT)).replace("\\", "/"),
                    "has_api_routes": (svc / "api" / "routes.go").exists(),
                    "has_migrations": (svc / "migrations").exists(),
                    "go_module": (svc / "go.mod").exists(),
                    "file_count": files,
                }
            )
    return data


def scan_gateway_endpoints() -> list[dict]:
    endpoints: list[dict] = []
    if not ROUTES_FILE.exists():
        return endpoints

    content = ROUTES_FILE.read_text(encoding="utf-8")
    pattern = re.compile(r'mux\.HandleFunc\("([A-Z]+)\s+([^\"]+)"\s*,\s*([^\)]+)\)')
    for match in pattern.finditer(content):
        method, path, handler = match.groups()
        endpoints.append({"method": method, "path": path, "handler": handler.strip()})
    return endpoints


def derive_wiring(endpoints: list[dict]) -> dict:
    wired_paths = {
        "patient_portal": [
            "/auth/register",
            "/auth/login",
            "/patients/me",
            "/patients/update",
            "/appointments",
            "/appointments/{id}",
        ],
        "org_portal": [
            "/org/auth/login",
            "/org/patients",
            "/org/patients/{id}",
            "/appointments",
            "/appointments/{id}",
        ],
    }

    endpoint_paths = {e["path"] for e in endpoints}
    return {
        "patient_portal_wired": [p for p in wired_paths["patient_portal"] if p in endpoint_paths],
        "patient_portal_missing": [p for p in wired_paths["patient_portal"] if p not in endpoint_paths],
        "org_portal_wired": [p for p in wired_paths["org_portal"] if p in endpoint_paths],
        "org_portal_missing": [p for p in wired_paths["org_portal"] if p not in endpoint_paths],
    }


def write_outputs(payload: dict) -> None:
    OUT_JSON.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    lines: list[str] = []
    lines.append("# Tenadam Backend API and Service Wiring")
    lines.append("")
    lines.append(f"Generated at: {payload['generated_at']}")
    lines.append("")

    lines.append("## Gateway Endpoints")
    lines.append("")
    for e in payload["gateway_endpoints"]:
        lines.append(f"- `{e['method']} {e['path']}` -> `{e['handler']}`")

    lines.append("")
    lines.append("## Portal Wiring Summary")
    lines.append("")
    lines.append("### Patient Portal Wired")
    for p in payload["wiring"]["patient_portal_wired"]:
        lines.append(f"- `{p}`")
    lines.append("")
    lines.append("### Patient Portal Missing")
    for p in payload["wiring"]["patient_portal_missing"]:
        lines.append(f"- `{p}`")

    lines.append("")
    lines.append("### Org Portal Wired")
    for p in payload["wiring"]["org_portal_wired"]:
        lines.append(f"- `{p}`")
    lines.append("")
    lines.append("### Org Portal Missing")
    for p in payload["wiring"]["org_portal_missing"]:
        lines.append(f"- `{p}`")

    lines.append("")
    lines.append("## Services Inventory")
    lines.append("")
    lines.append(f"Total services scanned: {len(payload['services'])}")
    lines.append("")
    for svc in payload["services"]:
        lines.append(
            f"- `{svc['domain']}/{svc['name']}` (routes={svc['has_api_routes']}, migrations={svc['has_migrations']}, files={svc['file_count']})"
        )

    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    services = scan_services()
    endpoints = scan_gateway_endpoints()
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "services": services,
        "gateway_endpoints": endpoints,
        "wiring": derive_wiring(endpoints),
        "operations": {
            "scanned_services_folder": True,
            "scanned_gateway_routes": ROUTES_FILE.exists(),
            "generated_docs": True,
            "generated_json": True,
        },
    }
    write_outputs(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
